import datetime

from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import View
from cla_common.smoketest import smoketest

from .smoketests import smoketests


def status(request):
    if "error" in request.GET.keys():
        raise Exception("ISSUE: %s" % datetime.datetime.now())
    results = list(smoketests.execute())
    passed = reduce(lambda acc, curr: acc and curr["status"], results, True)

    return render(
        request,
        "status/status_page.html",
        {"passed": passed, "last_updated": datetime.datetime.now(), "smoketests": results},
    )


def smoketests_json(request):
    """
    Run smoke tests and return results as JSON datastructure
    """
    from cla_frontend.apps.status.tests.smoketests import SmokeTests

    return JsonResponse(smoketest(SmokeTests))


class PingJsonView(View):
    """
    Stub IRaT PingJsonView for compatibility with current and imminent move to Kubernetes, obviating this view
    """

    def get(self, request):
        if "error" in request.GET.keys():
            raise Exception("ISSUE: %s" % datetime.datetime.now())
        response_data = {"build_tag": None, "build_date": None, "version_number": None, "commit_id": None}
        return JsonResponse(response_data)
