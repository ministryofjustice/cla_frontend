from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.conf import settings
from django.shortcuts import redirect


class HttpResponseForbidden(HttpResponse):
    status_code = 401


class Cla401Middleware(object):
    def process_exception(self, request, exception):
        if isinstance(exception, PermissionDenied):
            return HttpResponseForbidden()
        return None


class MaintenanceModeMiddleWare(object):
    MAINTENANCE_PATH = "/maintenance"

    def process_request(self, request):
        maintenance_mode = getattr(settings, "MAINTENANCE_MODE", False)
        if maintenance_mode and request.path != self.MAINTENANCE_PATH:
            return redirect(self.MAINTENANCE_PATH)
        if not maintenance_mode and request.path == self.MAINTENANCE_PATH:
            return redirect("/")
