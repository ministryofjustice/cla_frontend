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


class MaintenanceModeMiddleware(object):
    MAINTENANCE_PATH = "/maintenance"
    EXEMPT_PATHS = ["/status/ping.json", MAINTENANCE_PATH]

    def process_request(self, request):
        maintenance_mode = getattr(settings, "MAINTENANCE_MODE", False)
        if maintenance_mode and request.path not in self.EXEMPT_PATHS:
            return redirect(self.MAINTENANCE_PATH)
        if not maintenance_mode and request.path == self.MAINTENANCE_PATH:
            return redirect("/")

class NoCacheMiddleware(object):
    def process_response(self, request, response):
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response