import datetime
import json
import os

from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings

from cla_common.smoketest import smoketest
from .smoketests import basic, smoketests

import requests


class JSONResponse(HttpResponse):

    def __init__(self, data, **kwargs):
        content = json.dumps(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


def status(request):
    results = list(smoketests.execute())
    passed = reduce(lambda acc, curr: acc and curr['status'], results, True)

    return render(request, 'status/status_page.html', {
        'passed': passed,
        'last_updated': datetime.datetime.now(),
        'smoketests': results
    })


def ping(request):
    return JSONResponse({
        'version_number': os.environ.get('APPVERSION'),
        'build_date': os.environ.get('APP_BUILD_DATE'),
        'commit_id': os.environ.get('APP_GIT_COMMIT'),
        'build_tag': os.environ.get('APP_BUILD_TAG')
    })


def smoketests_json(request):
    """
    Run smoke tests and return results as JSON datastructure
    """

    from cla_frontend.apps.status.tests.smoketests import SmokeTests

    return JSONResponse(smoketest(SmokeTests))


def healthcheck_json(request):

    backend_healthcheck_uri = '%s/%s' % (settings.BACKEND_BASE_URI, 'status/healthcheck.json')
    response = requests.get(backend_healthcheck_uri)
    return JSONResponse(response.json())
