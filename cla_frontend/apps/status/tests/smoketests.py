import unittest

from django.conf import settings
import requests

from cla_frontend.apps.legalaid import addressfinder


class SmokeTests(unittest.TestCase):

    def test_can_access_backend(self):
        "access the backend"
        response = requests.get(settings.BACKEND_BASE_URI + '/status.json')

    def test_can_access_addressfinder(self):
        "lookup a postcode with AddressFinder"
        response = addressfinder.lookup_postcode('sw1a1aa')
        self.assertNotEqual(
            401,
            response.status_code,
            "Invalid token")
        self.assertEqual(200, response.status_code)

    def test_can_access_socketserver(self):
        "connect to socket server"
        self.fail()
