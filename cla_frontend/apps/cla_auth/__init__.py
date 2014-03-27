from django.core.exceptions import PermissionDenied
from django.contrib.auth.signals import user_login_failed
from django.contrib.auth import _clean_credentials, BACKEND_SESSION_KEY, load_backend
from django.conf import settings

from .backend import get_backend
from .utils import get_zone_profile


def authenticate(zone_name, **credentials):
    """
    If the given credentials are valid, return a User object.
    """

    backend = get_backend(zone_name)
    user = None
    try:
        user = backend.authenticate(**credentials)
    except TypeError:
        # This backend doesn't accept these credentials as arguments. Try the next one.
        pass
    except PermissionDenied:
        # This backend says to stop in our tracks - this user should not be allowed in at all.
        pass

    if user:
        # Annotate the user object with the path of the backend.
        user.backend = "%s.%s" % (backend.__module__, backend.__class__.__name__)
        return user

    # The credentials supplied are invalid to all backends, fire signal
    user_login_failed.send(sender=__name__,
            credentials=_clean_credentials(credentials))


def get_zone(request):
    try:
        backend_path = request.session[BACKEND_SESSION_KEY]
        assert backend_path in settings.AUTHENTICATION_BACKENDS
        backend = load_backend(backend_path)

        return get_zone_profile(backend.zone_name)
    except (KeyError, AssertionError):
        return None
    return None
