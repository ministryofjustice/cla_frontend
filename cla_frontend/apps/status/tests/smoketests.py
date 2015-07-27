import calendar
import json
import time
import unittest
import urllib
from urlparse import urlparse, urlunparse

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

        parts = urlparse(settings.SOCKETIO_SERVER_URL)
        host, _, port = parts.netloc.partition(':')
        host = host or settings.SITE_HOSTNAME
        port = port or '80'
        path = parts.path + '/1/'
        parts = list(parts)

        response = requests.get('http://{host}:{port}{path}?{params}'.format(
            host=host,
            port=port,
            path=path,
            params=urllib.urlencode({
                't': unix_timestamp(),
                'transport': 'polling',
                'b64': '1'})))
        session_id = json.loads(response.text[4:])['sid']

        parts[0] = 'ws'
        parts[1] = parts[1] or host
        parts[2] = path + 'websocket/'
        parts[4] = urllib.urlencode({
            'sid': session_id,
            'transport': 'polling',
            'timestamp': unix_timestamp()})
        ws_url = urlunparse(parts)
        ws = websocket.create_connection(ws_url)
        ws.send('0:::')
