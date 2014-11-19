#!/usr/bin/env python
import argparse
import subprocess
import os
import sys
import random
import signal
from Queue import Queue


def kill_child_processes(parent_pid, sig=signal.SIGTERM):
    ps_command = subprocess.Popen("ps -o pid --ppid %d --noheaders" % parent_pid, shell=True, stdout=subprocess.PIPE)
    ps_output = ps_command.stdout.read()
    retcode = ps_command.wait()
    # assert retcode == 0, "ps command returned %d" % retcode
    for pid_str in ps_output.split("\n")[:-1]:
        os.kill(int(pid_str), sig)


background_processes = Queue()
try:
    PROJECT_NAME = "cla_frontend"
    BACKEND_PROJECT_NAME = "cla_backend"

    # use python scripts/jenkins/build.py integration

    # args
    parser = argparse.ArgumentParser(
        description='Build project ready for testing by Jenkins.')
    parser.add_argument('envname', metavar='envname', type=str,
                        nargs=1, help='e.g. integration, production, etc.')
    parser.add_argument('--backend-dir', metavar='backend_dir', type=str, nargs=1,
                        help='path to backend project')
    args = parser.parse_args()

    env = args.envname[0]
    backend_workspace = args.backend_dir[0]

    env_name = "%s-%s" % (PROJECT_NAME, env)
    env_path = "/tmp/jenkins/envs/%s" % env_name
    bin_path = "%s/bin" % env_path

    backend_env_name = "%s-%s" % (BACKEND_PROJECT_NAME, env)
    backend_env_path = "/tmp/jenkins/envs/%s" % backend_env_name
    backend_bin_path = "%s/bin" % backend_env_path


    def run(command, ignore_rc=False, **kwargs):
        defaults = {
            'shell': True
        }
        defaults.update(kwargs)

        return_code = subprocess.call(command, **defaults)
        if return_code:
            if not ignore_rc:
                sys.exit(return_code)


    def run_bg(command, **kwargs):
        defaults = {
            'shell': True,
        }
        defaults.update(kwargs)
        process = subprocess.Popen(command, **defaults)

        background_processes.put(process)
        return process

    print 'starting...'

    backend_port = random.randint(8005, 8999)
    frontend_port = backend_port + 1
    os.environ['BACKEND_BASE_PORT'] = '%s' % backend_port
    os.environ['FRONTEND_BASE_PORT'] = '%s' % frontend_port

    #run('pkill -f envs/cla_.*integration', ignore_rc=True)

    # setting up virtualenv
    if not os.path.isdir(env_path):
        run('virtualenv --no-site-packages %s' % env_path)

    run('%s/pip install -r requirements/jenkins.txt' % bin_path)


    # Remove .pyc files from the project
    run("find . -name '*.pyc' -delete")

    # make sure bower really does install the right versions every time
    run("rm -rf cla_frontend/assets-src/vendor")

    # build js assets
    run('%s/python manage.py builddata constants_json' % bin_path)
    npm = run_bg('npm install')
    bower = run_bg("bower install")
    npm.wait()
    bower.wait()
    gulp = run_bg("gulp build")

    # run python tests
    py_test = run_bg(("%s/python manage.py jenkins --coverage-rcfile=.coveragerc "
         "--settings=cla_frontend.settings.jenkins") % bin_path)

    # start backend and frontend dev servers

    backend_process = run_bg(
        "cd %s && %s/python manage.py testserver kb_from_knowledgebase.json initial_category.json test_provider.json initial_mattertype.json test_auth_clients.json initial_media_codes.json test_rotas.json test_casearchived.json test_providercases.json test_provider_allocations.json --addrport %s --noinput --settings=cla_backend.settings.jenkins > /dev/null" % (backend_workspace.replace(' ', '\ '), backend_bin_path, backend_port)
    )
    wget_backend = run_bg("wget http://localhost:%s/admin/ -O/dev/null -t 20 --retry-connrefused --waitretry=2 -T 60" % backend_port)

    py_test.wait()
    gulp.wait()
    test = run_bg("%s/python manage.py runserver 0.0.0.0:%s --settings=cla_frontend.settings.jenkins --nothreading --noreload > /dev/null" % (bin_path, frontend_port))
    wget_frontend = run_bg("wget http://localhost:%s/ -O/dev/null -t 20 --retry-connrefused --waitretry=2 -T 60" % frontend_port)

    # run Karma unit tests
    karma = run_bg('npm run test-single-run')

    wget_backend.wait()
    wget_frontend.wait()

    # run protractor tests against SauceLabs
    run('node_modules/protractor/bin/protractor cla_frontend/assets-src/javascripts/app/test/protractor.conf.jenkins.js')

    karma.wait()
    print 'exiting...'
finally:
    print "killing processes: queue size: %s" % background_processes.qsize()
    while not background_processes.empty():
        process = background_processes.get()
        try:
            print "kill: proccess with pid: %s" % process.pid
            kill_child_processes(process.pid)
            process.kill()
        except OSError:
            # already finished
            pass

    # kill db (this is in backend settings.jenkins)
    run('dropdb test_cla_backend%s' % backend_port)

#run('pkill -f envs/cla_.*integration', ignore_rc=True)
