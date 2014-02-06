# -*- coding: utf-8 -*-
from flask.ext.testing import TestCase
from cla_frontend.settings import TestConfig
from cla_frontend.app import create_app
#from cla_frontend.database import db


# class DbTestCase(TestCase):
#     """Base TestCase for tests that require a database."""
#
#     def create_app(self):
#         app = create_app(TestConfig)
#         with app.app_context():
#             db.create_all()
#         return app
#
#     def tearDown(self):
#         db.session.remove()
#         db.drop_all()