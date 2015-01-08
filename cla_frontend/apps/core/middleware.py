from django.core.exceptions import PermissionDenied
from django.http import HttpResponse


class HttpResponseForbidden(HttpResponse):
    status_code = 401


class Cla401Middleware(object):
    def process_exception(self, request, exception):
        if isinstance(exception, PermissionDenied):
            return HttpResponseForbidden()
        return None
