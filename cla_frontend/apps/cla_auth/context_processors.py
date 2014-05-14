from django.core import signing

from .constants import PROFILE_SIGNED_COOKIE_KEY


def cla_auth(request):
    context = {}

    signed_profile = request.get_signed_cookie(PROFILE_SIGNED_COOKIE_KEY, None)
    if signed_profile:
        profile = signing.loads(signed_profile)
        context['profile'] = profile

    return context
