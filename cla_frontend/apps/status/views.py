import datetime

from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import View
from cla_common.smoketest import smoketest

from .smoketests import smoketests


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
    return JsonResponse(smoketest(SmokeTests))


