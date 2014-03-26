from django.core.exceptions import PermissionDenied
from django.contrib.auth.signals import user_login_failed
from django.contrib.auth import _clean_credentials

from .backend import ClaBackend


def authenticate(**credentials):
    """
    If the given credentials are valid, return a User object.
    """

    backend = ClaBackend()
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
        user._auth_app = credentials.get('auth_app')
        return user

    # The credentials supplied are invalid to all backends, fire signal
    user_login_failed.send(sender=__name__,
            credentials=_clean_credentials(credentials))


def get_login_redirect_url(auth_app):
    backend = ClaBackend()
    return backend.get_login_redirect_url(auth_app)
