from django.shortcuts import redirect
from django.conf import settings

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
