from django.utils.functional import SimpleLazyObject

from . import get_zone as auth_get_zone


def get_zone(request):
    if not hasattr(request, "_cached_zone"):
        request._cached_zone = auth_get_zone(request)
    return request._cached_zone


class ZoneMiddleware(object):
    def process_request(self, request):
        assert hasattr(
            request, "session"
        ), "The Django zone middleware requires session middleware to be installed. Edit your MIDDLEWARE_CLASSES setting to insert 'django.contrib.sessions.middleware.SessionMiddleware'."

        request.zone = SimpleLazyObject(lambda: get_zone(request))
