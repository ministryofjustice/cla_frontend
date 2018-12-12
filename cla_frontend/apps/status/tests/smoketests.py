import calendar
import json
import time
import unittest
import urllib
from urlparse import urlparse, urlunparse

import requests
import websocket
from django.conf import settings
from cla_common.address_lookup.ordnance_survey import AddressLookup


def unix_timestamp():
    return calendar.timegm(time.gmtime())


class SmokeTests(unittest.TestCase):

    def test_can_access_backend(self):
        "access the backend"
        response = requests.get(settings.BACKEND_BASE_URI + '/status.json')

    def test_can_lookup_postcode(self):
        """Lookup a postcode with OS Places"""
        postcode_to_lookup = 'SW1A 1AA'
        key = settings.OS_PLACES_API_KEY
        addresses = AddressLookup(key=key).by_postcode(postcode_to_lookup)
        self.assertGreater(len(addresses), 0)
        result_postcode = addresses[0].get('DPA', {}).get('POSTCODE')
        self.assertEqual(result_postcode, postcode_to_lookup)

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
