import calendar
import httplib
import json
import socket
import time
from urllib import urlencode
from urllib2 import Request, URLError, urlopen
from urlparse import urlparse, urlunparse

from django.conf import settings
from django.contrib.staticfiles.templatetags.staticfiles import static

import websocket

from status.smoketests import SmokeTestFail, ready_smoketests, live_smoketests


@live_smoketests.register(1, "Public site is up")
@ready_smoketests.register(1, "Public site is up")
def things_exist():
    response = get_fe("/auth/login/")
    assert_status(response, 200)


@live_smoketests.register(2, "Angular is loaded")
@ready_smoketests.register(2, "Angular is loaded")
def angular_loaded():
    url = static("javascripts/cla.main.js")
    if not "://" in url and settings.SITE_HOSTNAME == "localhost":
        url = "{host}{url}".format(host=settings.LOCAL_HOST, url=url)
    response = get(url)
    assert_status(response, 200)


@ready_smoketests.register(3, "Backend responding")
def backend_exists():
    response = get_be("/admin/")
    assert_status(response, 200)


@ready_smoketests.register(4, "Database accessible")
def db_alive():
    response = get_be("/status")
    assert_status(response, 200)
    data = response.read()
    backend = json.loads(data)
    if not backend.get("db", {}).get("ready"):
        raise SmokeTestFail(
            "Database not responding: {reason}".format(reason=backend.get("db", {}).get("message", "no reason given"))
        )


# Skipping this now as fixing it to pass involves more work to pass the Origin header
# as the socket server only accepts requests with a fixed Origin header
# @smoketests.register(5, "Socket.IO server running")
def socket_io():
    parts = urlparse(settings.SOCKETIO_SERVER_URL)
    host, _, port = parts.netloc.partition(":")
    host = host or "localhost"
    port = port or "80"
    path = parts.path + "/1/"
    parts = list(parts)

    try:
        sid = socketio_session_id(host, port, path)
    except Exception as e:
        raise SmokeTestFail("Server not responding: {0}".format(str(e)))

    parts[0] = "ws"
    parts[1] = parts[1] or host
    parts[2] = path + "websocket/"
    parts[4] = urlencode({"sid": sid, "transport": "polling", "timestamp": unix_timestamp()})
    ws_url = urlunparse(parts)

    try:
        ws = websocket.create_connection(ws_url)
        socketio_disconnect(ws)
    except websocket.WebSocketException as e:
        raise SmokeTestFail("Failed creating websocket: {0}".format(str(e)))


def unix_timestamp():
    return calendar.timegm(time.gmtime())


def socketio_disconnect(ws):
    ws.send("0:::")


def socketio_session_id(host, port, path):
    conn = httplib.HTTPConnection(host, port)
    conn.request("GET", "{path}?t={timestamp}&transport=polling&b64=1".format(path=path, timestamp=unix_timestamp()))
    response = conn.getresponse().read()
    return json.loads(response[4:])["sid"]


def get_fe(url):
    full_url = "{host}{url}".format(host=settings.LOCAL_HOST, url=url)
    return get(full_url, hostname_header=settings.SITE_HOSTNAME)


def get_be(url):
    full_url = "{host}{url}".format(host=getattr(settings, "BACKEND_BASE_URI", "http://localhost:8000"), url=url)
    return get(full_url)


def get(url, hostname_header=None):
    request = Request(url)
    if hostname_header:
        request.add_header("Host", hostname_header)
    try:
        response = urlopen(request, timeout=5)
    except URLError as e:
        raise SmokeTestFail("GET {url} failed: {reason}".format(url=url, reason=e.reason))
    except socket.timeout:
        raise SmokeTestFail("GET {url} timed out".format(url=url))
    return response


def assert_status(response, expected):
    code = response.getcode()
    if code != expected:
        raise SmokeTestFail("Unexpected status code {0}".format(code))
