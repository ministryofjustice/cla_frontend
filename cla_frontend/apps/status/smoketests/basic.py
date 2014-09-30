import calendar
import httplib
import json
import socket
import time
from urllib import urlencode
from urllib2 import URLError, urlopen
from urlparse import urlparse

from django.conf import settings

import websocket

from status.smoketests import SmokeTestFail, smoketests


@smoketests.register(1, 'Public site is up')
def things_exist():
    response = get(prod_fe('/'))
    assert_status(response, 200)


@smoketests.register(2, 'Angular is loaded')
def angular_loaded():
    response = get(prod_fe('/static/javascripts/cla.main.js'))
    assert_status(response, 200)


@smoketests.register(3, 'Backend responding')
def backend_exists():
    response = get(prod_be('/admin/'))
    assert_status(response, 200)


@smoketests.register(4, 'Database accessible')
def db_alive():
    response = get(prod_be('/status'))
    assert_status(response, 200)
    backend = json.loads(response.read())
    if not backend.get('db', {}).get('ready'):
        raise SmokeTestFail('Database not responding: {reason}'.format(
            reason=backend.get('db', {}).get('message', 'no reason given')))


@smoketests.register(5, 'Socket.IO server running')
def socket_io():
    parts = urlparse(settings.SOCKETIO_SERVER_URL)
    path = '/socket.io/1/'

    try:
        sid = socketio_session_id(parts.hostname, parts.port, path)
    except Exception as e:
        raise SmokeTestFail('Server not responding: {0}'.format(str(e)))

    ws_url = 'ws://{host}:{port}{path}websocket/?{params}'.format(
        host=parts.hostname,
        port=parts.port,
        path=path,
        params=urlencode({
            'sid': sid,
            'transport': 'polling',
            'timestamp': unix_timestamp()}))

    try:
        ws = websocket.create_connection(ws_url)
        socketio_disconnect(ws)
    except WebSocketException as e:
        raise SmokeTestFail('Failed creating websocket: {0}'.format(str(e)))


def unix_timestamp():
    return calendar.timegm(time.gmtime())


def socketio_disconnect(ws):
    ws.send('0:::')


def socketio_session_id(host, port, path):
    conn = httplib.HTTPConnection(host, port)
    conn.request('GET', '{path}?t={timestamp}&transport=polling&b64=1'.format(
        path=path,
        timestamp=unix_timestamp()))
    response = conn.getresponse().read()
    return json.loads(response[4:])['sid']


def prod_fe(url):
    #return 'http://localhost:8001{url}'.format(url=url)
    return prod('cases', url)


def prod_be(url):
    #return 'http://localhost:8000{url}'.format(url=url)
    return prod('fox', url)


def prod(host, url):
    return 'https://{host}.civillegaladvice.service.gov.uk{url}'.format(
        host=host, url=url)


def get(url):
    try:
        response = urlopen(url, timeout=5)
    except URLError as e:
        raise SmokeTestFail('GET {url} failed: {reason}'.format(
            url=url, reason=e.reason))
    except socket.timeout as t:
        raise SmokeTestFail('GET {url} timed out'.format(
            url=url))
    return response


def assert_status(response, expected):
    code = response.getcode()
    if code != expected:
        raise SmokeTestFail('Unexpected status code {0}'.format(code))
