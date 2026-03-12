from functools import wraps
from urlparse import urlparse
from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.shortcuts import resolve_url
from django.utils.decorators import available_attrs
from django.utils.encoding import force_str
from django.http import Http404


def get_available_zone_names():
    return settings.ZONE_PROFILES.keys()


def get_zone_profile(zone_name):
    zone = dict(settings.ZONE_PROFILES.get(zone_name, {}))
    if zone:
        zone["name"] = zone_name
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
            r_zone = getattr(request, "zone") or {}
            if request.user.is_authenticated():
                if r_zone.get("name") == zone:
                    return view_func(request, *args, **kwargs)
            path = request.build_absolute_uri()
            # urlparse chokes on lazy objects in Python 3, force to str
            resolved_login_url = force_str(
                resolve_url(login_url or r_zone.get("LOGIN_REDIRECT_URL") or settings.LOGIN_URL)
            )
            # If the login url is the same scheme and net location then just
            # use the path as the "next" url.
            login_scheme, login_netloc = urlparse(resolved_login_url)[:2]
            current_scheme, current_netloc = urlparse(path)[:2]
            missing_or_matching_login_scheme = not login_scheme or login_scheme == current_scheme
            missing_or_matching_login_netloc = not login_netloc or login_netloc == current_netloc
            if missing_or_matching_login_scheme and missing_or_matching_login_netloc:
                path = request.get_full_path()
            from django.contrib.auth.views import redirect_to_login

            return redirect_to_login(path, resolved_login_url, redirect_field_name)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator


def can_access_ui(function=None, ui=None, redirect_field_name=REDIRECT_FIELD_NAME):
    def decorator(view_func):
        @wraps(view_func, assigned=available_attrs(view_func))
        def _wrapped_view(request, *args, **kwargs):
            login_url = settings.ZONE_PROFILES["entra"]["LOGIN_REDIRECT_URL"]
            print("LOGIN_URL", login_url)
            if request.user.is_authenticated() and ui in request.user.ui_access:
                return view_func(request, *args, **kwargs)
            path = request.build_absolute_uri()
            resolved_login_url = resolve_url(login_url)
            # If the login url is the same scheme and net location then just
            # use the path as the "next" url.
            login_scheme, login_netloc = urlparse(resolved_login_url)[:2]
            current_scheme, current_netloc = urlparse(path)[:2]
            missing_or_matching_login_scheme = not login_scheme or login_scheme == current_scheme
            missing_or_matching_login_netloc = not login_netloc or login_netloc == current_netloc
            if missing_or_matching_login_scheme and missing_or_matching_login_netloc:
                path = request.get_full_path()
            from django.contrib.auth.views import redirect_to_login

            return redirect_to_login(path, resolved_login_url, redirect_field_name)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator


def call_centre_zone_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if settings.USE_LEGACY_AUTH:
            return zone_required(view_func, zone="call_centre")(request, *args, **kwargs)
        else:
            return can_access_ui(view_func, ui="operator")(request, *args, **kwargs)

    return _wrapped_view


def cla_provider_zone_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if settings.USE_LEGACY_AUTH:
            return zone_required(view_func, zone="cla_provider")(request, *args, **kwargs)
        else:
            return can_access_ui(view_func, ui="provider")(request, *args, **kwargs)

    return _wrapped_view


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


def user_has_entra_access(username):
    """
    Checks if the user is in the list of users allowed to use Entra, and that legacy auth is not enabled.
    """
    if settings.USE_LEGACY_AUTH:
        return False
    return username in settings.USERS_ALLOWED_ENTRA_ACCESS
