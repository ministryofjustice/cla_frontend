import json
from urllib2 import URLError, urlopen

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
    if not backend.db.ready:
        raise SmokeTestFail('Database not responding: {reason}'.format(
            reason=backend.db.message))


@smoketests.register(5, 'Socket.io server running')
def socket_io():
    response = get(prod_sio('/'))
    assert_status(response, 200)
    socketio = json.loads(response.read())
    if not socketio['status'] == 'OK':
        raise SmokeTestFail('Socket.IO server not responding')


def prod_fe(url):
    return prod('cases', url)


def prod_sio(url):
    return prod_fe(url)


def prod_be(url):
    return prod('fox', url)


def prod(host, url):
    return 'https://{host}.civillegaladvice.service.gov.uk{url}'.format(
        host=host, url=url)


def get(url):
    try:
        response = urlopen(url)
    except URLError as e:
        raise SmokeTestFail('GET {url} failed: {reason}'.format(
            url=url, reason=e.reason))
    return response


def assert_status(response, expected):
    code = response.getcode()
    if code != expected:
        raise SmokeTestFail('Unexpected status code {0}'.format(code))
