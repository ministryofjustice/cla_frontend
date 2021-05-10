import json
import socket
from urllib2 import Request, URLError, urlopen

import requests
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
    if "://" in url:
        response = get(url)
    else:
        response = get_fe(url)
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


@ready_smoketests.register(5, "Socket.IO server connecting")
def socket_io():
    url = settings.SOCKETIO_SERVICE_URL

    sid_request_params = {"eio": 3, "transport": "polling"}
    headers = {"Origin": "localhost:"}
    try:
        response = requests.get("http://{url}".format(url=url), params=sid_request_params, headers=headers)
        sid = json.loads(response.content[5:])["sid"]
    except Exception as e:
        raise SmokeTestFail("Server not responding: {0}".format(str(e)))

    ws_url = "ws://{url}?eio=3&transport=websocket&sid={sid}"
    try:
        ws = websocket.create_connection(ws_url.format(url=url, sid=sid))
        ws.send("0:::")
    except websocket.WebSocketException as e:
        raise SmokeTestFail("Failed creating websocket: {0}".format(str(e)))


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
