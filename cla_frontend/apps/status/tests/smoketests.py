import calendar
import json
import time
import unittest
import urllib

from django.conf import settings
import requests
import websocket

from cla_frontend.apps.legalaid import addressfinder


def unix_timestamp():
    return calendar.timegm(time.gmtime())


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

        response = requests.get('{host}/1/?{params}'.format(
            host=settings.SOCKETIO_SERVER_URL,
            params=urllib.urlencode({
                't': unix_timestamp(),
                'transport': 'polling',
                'b64': '1'})))
        session_id = json.loads(response.text[4:])['sid']

        ws_url = '{host}/1/websocket/?{params}'.format(
            host=settings.SOCKETIO_SERVER_URL.replace('http://', 'ws://'),
            params=urllib.urlencode({
                'sid': session_id,
                'transport': 'polling',
                'timestamp': unix_timestamp()}))
        ws = websocket.create_connection(ws_url)
        ws.send('0:::')
