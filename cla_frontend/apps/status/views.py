import datetime
import json

from django.http import HttpResponse
from django.shortcuts import render

from cla_common.smoketest import smoketest
from .smoketests import smoketests


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


def smoketests_json(request):
    """
    Run smoke tests and return results as JSON datastructure
    """

    from cla_frontend.apps.status.tests.smoketests import SmokeTests

    return JSONResponse(smoketest(SmokeTests))
