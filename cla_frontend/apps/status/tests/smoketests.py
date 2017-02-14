import calendar
import json
import time
import unittest
import urllib
from urlparse import urlparse, urlunparse

from django.conf import settings
import requests
import websocket

import postcodeinfo


def unix_timestamp():
    return calendar.timegm(time.gmtime())


class SmokeTests(unittest.TestCase):

    def test_can_access_backend(self):
        "access the backend"
        response = requests.get(settings.BACKEND_BASE_URI + '/status.json')

    def test_can_access_geocoder(self):
        "lookup a postcode with PostcodeInfo"
        client = postcodeinfo.Client()
        postcode = client.lookup_postcode('SW1A 1AA')
        self.assertEqual(postcode.normalised, 'sw1a1aa')

    def test_can_access_socketserver(self):
        "connect to socket server"

        parts = urlparse(settings.SOCKETIO_SERVER_URL)
        host, _, port = parts.netloc.partition(':')
        host = host or settings.SITE_HOSTNAME
        port = ':%s' % port if port else ''
        path = parts.path + '/1/'
        parts = list(parts)
        protocol = 'https' if settings.SESSION_COOKIE_SECURE else 'http'
        origin = '{protocol}://{host}'.format(
            protocol=protocol,
            host=host
        )
        headers = {
            'Origin': origin,
        }

        response = requests.get('{origin}{port}{path}?{params}'.format(
                origin=origin,
                port=port,
                path=path,
                params=urllib.urlencode({
                    't': unix_timestamp(),
                    'transport': 'polling',
                    'b64': '1'})
            ),
            timeout=10, headers=headers, verify=False
        )

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
