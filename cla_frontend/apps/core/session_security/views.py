""" One view method for AJAX requests by SessionSecurity objects. """
import json

from datetime import datetime, timedelta
from core.middleware import HttpResponseForbidden
from core.session_security.utils import get_expires_in

from django import http
from django.core.serializers.json import DjangoJSONEncoder
from session_security.utils import get_last_activity
from session_security.views import PingView


class JsonPingView(PingView):

    """
    This view is just in charge of returning the number of seconds since the
    'real last activity' that is maintained in the session by the middleware.
    """

    def get(self, request, *args, **kwargs):
        if '_session_security' not in request.session:
            # It probably has expired already
            return HttpResponseForbidden(json.dumps({'logout': True}), content_type='application/json', status=403)

        last_activity = get_last_activity(request.session)
        inactive_for = (datetime.now() - last_activity).total_seconds() * 1000
        expires_in = get_expires_in(request.session).total_seconds() * 1000

        return http.HttpResponse(json.dumps({
            'inactive_for': inactive_for,
            'last_activity': last_activity,
            'expires_in': expires_in
        }, cls=DjangoJSONEncoder), content_type='application/json')
