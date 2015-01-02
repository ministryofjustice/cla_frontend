from django.shortcuts import redirect
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

import requests

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
        resp = requests.get(
            "%s/%s?%s" % (settings.ADDRESSFINDER_API_HOST,
                          path, request.GET.urlencode()),
            headers={
                'Authorization': 'Token %s' % settings.ADDRESSFINDER_API_TOKEN
            },
            timeout=(2.0, 5.0)
        )
        return HttpResponse(resp.text, content_type="application/json")
    except (requests.exceptions.ConnectionError,
            requests.exceptions.Timeout):
        return HttpResponse('', content_type="application/json", status=404)
