import datetime

from django.shortcuts import render

from .smoketests import basic, smoketests


def status(request):
    results = list(smoketests.execute())
    passed = reduce(lambda acc, curr: acc and curr['status'], results, True)

    return render(request, 'status/status_page.html', {
        'passed': passed,
        'last_updated': datetime.datetime.now(),
        'smoketests': results
    })
