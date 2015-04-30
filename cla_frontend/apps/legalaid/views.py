from django.shortcuts import redirect
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

import requests

import addressfinder
from cla_auth import get_zone


def home(request):
    """
    Redirects to LOGIN if the user is not logged in, otherwise, it redirects
    to the appropriate dashboard page
    """
    if not request.user.is_authenticated():
        return redirect(settings.LOGIN_URL)

    zone = get_zone(request)
    return redirect(zone['LOGIN_REDIRECT_URL'])


@login_required
def addressfinder_proxy_view(request, path):
    try:
        response = addressfinder.query(path, request.GET)
        return HttpResponse(response.text, content_type="application/json")
    except (requests.exceptions.ConnectionError,
            requests.exceptions.Timeout):
        return HttpResponse('', content_type="application/json", status=404)
