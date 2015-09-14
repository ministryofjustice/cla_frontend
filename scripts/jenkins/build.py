#!/usr/bin/env python
import argparse
import logging
import os
import random
import signal
import subprocess
import sys
from Queue import Queue


logging.basicConfig(level='INFO')
log = logging.getLogger(__name__)

PROJECT_NAME = 'cla_frontend'

background_processes = Queue()


def parse_args():
    parser = argparse.ArgumentParser(
        description='Build project ready for testing by Jenkins.')
    parser.add_argument('envname', type=str,
                        help='e.g. integration, production, etc.')
    parser.add_argument('--backend-hash', type=str, default='',
                        help='cla_backend *commit hash* to run tests against; '
                             'defaults to latest develop branch commit')

    args = parser.parse_args()
    return {
        'envname': args.envname,
        'backend_hash': args.backend_hash,
    }


def run(command, background=False, **kwargs):
    if 'shell' not in kwargs:
        kwargs['shell'] = True

    log.info('Running {command}'.format(command=command))

    if background:
        process = subprocess.Popen(command, **kwargs)
        background_processes.put(process)
        return process

    return_code = subprocess.call(command, **kwargs)
    if return_code:
        sys.exit(return_code)


def make_virtualenv(env):
    venv_path = '/tmp/jenkins/envs/{project}-{env}'.format(
        project=PROJECT_NAME,
        env=env)

    if not os.path.isdir(venv_path):
        run('/usr/local/bin/virtualenv {path}'.format(path=venv_path))

    return venv_path


def install_dependencies(venv_path):
    run('{venv}/bin/pip install -U setuptools pip wheel'.format(
        venv=venv_path))
    run('{venv}/bin/pip install -r requirements/jenkins.txt'.format(
        venv=venv_path))


def clean_pyc():
    run("find . -name '*.pyc' -delete")


def wait_until_available(url):
    wget = run((
        'wget {url} -O/dev/null -t 20 --retry-connrefused --waitretry=2 '
        '-T 60').format(url=url),
        background=True)
    wget.wait()


def remove_old_static_assets():
    run('rm -rf cla_frontend/assets-src/vendor')
    # run('rm -rf cla_frontend/assets')


def update_static_assets(venv_path):
    run('%s/bin/python manage.py builddata constants_json' % venv_path)
    bundle = run('bundle install', background=True)
    npm_prune = run('npm prune', background=True)
    bower_prune = run('bower prune', background=True)
    npm_prune.wait()
    npm = run('npm install', background=True)
    bower_prune.wait()
    bower = run('bower install', background=True)
    npm.wait()
    bower.wait()
    bundle.wait()
    gulp = run('gulp build', background=True)
    gulp.wait()


def run_python_tests(venv_path):
    return run(
        ('%s/bin/python manage.py jenkins --coverage-rcfile=.coveragerc '
         '--settings=cla_frontend.settings.jenkins') % venv_path,
        background=True
    )


def _port(start_from=8100, up_to=8299):
    port = random.randint(start_from, up_to)
    while True:
        yield port
        port += 1


gen_port = _port()


def run_server(env, backend_hash=''):
    venv = '/tmp/jenkins/envs/cla_backend-%s' % env
    project_dir = '/srv/jenkins/shared-backend/%s-%s' % (PROJECT_NAME, env)
    if not os.path.isdir(project_dir):
        os.makedirs(project_dir)

    if not os.path.isdir(os.path.join(project_dir, '.git')):
        run('cd {project_dir} && git clone https://github.com/ministryofjustice/cla_backend.git .'.format(
            project_dir=project_dir,
        ))
    if backend_hash:
        run('cd {project_dir} && git fetch --prune && git checkout -f {backend_hash}'.format(
            project_dir=project_dir,
            backend_hash=backend_hash,
        ))
    else:
        run('cd {project_dir} && git fetch --prune && git checkout develop && git pull'.format(
            project_dir=project_dir,
        ))

    backend_port = next(gen_port)
    os.environ['CLA_BACKEND_PORT'] = str(backend_port)
    os.environ['BACKEND_TEST_DB_SUFFIX'] = '4%s' % PROJECT_NAME

    fixtures = (
        'initial_groups.json',
        'kb_from_knowledgebase.json',
        'initial_category.json',
        'test_provider.json',
        'initial_mattertype.json',
        'test_auth_clients.json',
        'initial_media_codes.json',
        'test_rotas.json',
        'test_casearchived.json',
        'test_providercases.json',
        'test_provider_allocations.json',
        # TODO: add complaints category fixtures once that branch is merged
    )

    run(('cd {project_dir} && '
         '{venv}/bin/python manage.py testserver {fixtures} '
         '--addrport {port} --noinput '
         '--settings=cla_backend.settings.jenkins '
         '> {project_dir}/testserver.log~').format(
            project_dir=project_dir,
            venv=venv,
            fixtures=' '.join(fixtures),
            port=backend_port),
        background=True)


def run_tests(venv_path):
    wait_until_available('http://localhost:{port}/admin/'.format(
        port=os.environ.get('CLA_BACKEND_PORT'))
    )

    frontend_port = next(gen_port)
    os.environ['CLA_FRONTEND_PORT'] = str(frontend_port)

    run(
        '{venv_path}/bin/python manage.py runserver 0.0.0.0:{port} '
        '--settings=cla_frontend.settings.jenkins '
        '--nothreading --noreload '
        '> /dev/null'.format(
            venv_path=venv_path,
            port=frontend_port,
        ),
        background=True)

    karma = run('npm run test-single-run', background=True)

    wait_until_available('http://localhost:{port}/'.format(port=frontend_port))

    run('node_modules/protractor/bin/protractor tests/angular-js/protractor.conf.jenkins.js')

    karma.wait()


def kill_child_processes(pid, sig=signal.SIGTERM):
    ps_cmd = subprocess.Popen(
        'ps -o pid --ppid {0} --noheaders'.format(pid),
        shell=True,
        stdout=subprocess.PIPE)
    ps_out = ps_cmd.stdout.read()
    ps_cmd.wait()
    for pid_str in ps_out.split('\n')[:-1]:
        os.kill(int(pid_str), sig)


def kill_all_background_processes():
    while not background_processes.empty():
        process = background_processes.get()
        try:
            kill_child_processes(process.pid)
            process.kill()
        except OSError:
            pass


def main():
    try:
        args = parse_args()
        env = args['envname']
        backend_hash = args['backend_hash']
        venv_path = make_virtualenv(env)
        install_dependencies(venv_path)
        remove_old_static_assets()
        update_static_assets(venv_path)
        clean_pyc()
        python_tests = run_python_tests(venv_path)
        run_server(env, backend_hash)
        python_tests.wait()
        run_tests(venv_path)
    finally:
        kill_all_background_processes()


if __name__ == '__main__':
    main()
