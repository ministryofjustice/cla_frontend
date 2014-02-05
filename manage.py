#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import subprocess
from flask.ext.script import Manager, Shell, Server
from flask.ext.migrate import MigrateCommand

from cla_frontend.app import create_app
from cla_frontend.user.models import User
from cla_frontend.settings import DevConfig, ProdConfig
from cla_frontend.database import db

if os.environ.get("CLA_FRONTEND_ENV") == 'prod':
    app = create_app(ProdConfig)
else:
    app = create_app(DevConfig)

manager = Manager(app)
TEST_CMD = "nosetests"

def _make_context():
    '''Return context dict for a shell session so you can access
    app, db, and the User model by default.
    '''
    return {'app': app, 'db': db, 'User': User}

@manager.command
def test():
    '''Run the tests.'''
    status = subprocess.call(TEST_CMD, shell=True)
    sys.exit(status)

manager.add_command("server", Server())
manager.add_command("shell", Shell(make_context=_make_context))
manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()
