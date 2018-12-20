from functools import wraps
from urlparse import urlparse
from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.shortcuts import resolve_url
from django.utils.decorators import available_attrs
from django.utils.encoding import force_str
from django.utils.functional import curry
from django.http import Http404


def get_available_zone_names():
    return settings.ZONE_PROFILES.keys()


def get_zone_profile(zone_name):
    zone = dict(settings.ZONE_PROFILES.get(zone_name, {}))
    if zone:
        zone['name'] = zone_name
        return zone
    return None


def zone_required(function=None, redirect_field_name=REDIRECT_FIELD_NAME, zone=None, login_url=None):
    """
    Decorator for views that checks that the zone for logged in user matches,
    given zone kwarg redirecting
    to the log-in page if necessary.
    """

    def decorator(view_func):
        @wraps(view_func, assigned=available_attrs(view_func))
        def _wrapped_view(request, *args, **kwargs):
            r_zone = getattr(request, 'zone') or {}
            if request.user.is_authenticated():
                if r_zone.get('name') == zone:
                    return view_func(request, *args, **kwargs)
            path = request.build_absolute_uri()
            # urlparse chokes on lazy objects in Python 3, force to str
            resolved_login_url = force_str(
                resolve_url(login_url or r_zone.get('LOGIN_REDIRECT_URL') or settings.LOGIN_URL))
            # If the login url is the same scheme and net location then just
            # use the path as the "next" url.
            login_scheme, login_netloc = urlparse(resolved_login_url)[:2]
            current_scheme, current_netloc = urlparse(path)[:2]
            missing_or_matching_login_scheme = not login_scheme or login_scheme == current_scheme
            missing_or_matching_login_netloc = not login_netloc or login_netloc == current_netloc
            if missing_or_matching_login_scheme and missing_or_matching_login_netloc:
                path = request.get_full_path()
            from django.contrib.auth.views import redirect_to_login
            return redirect_to_login(
                path, resolved_login_url, redirect_field_name)
        return _wrapped_view
    if function:
        return decorator(function)
    return decorator


call_centre_zone_required = curry(zone_required, zone='call_centre')
cla_provider_zone_required = curry(zone_required, zone='cla_provider')


def manager_member_required(view_func):
    """
    Decorator for views that checks that the user is logged in and is a member
    member.
    """
    @wraps(view_func)
    def _checklogin(request, *args, **kwargs):
        if request.user.is_authenticated() and request.user.is_manager:
            # The user is valid. Continue to the admin page.
            return view_func(request, *args, **kwargs)

        raise Http404()
    return _checklogin
