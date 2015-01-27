from datetime import datetime, timedelta
from core.session_security.utils import get_expires_in

from django.contrib.auth import logout
from django.conf import settings

from session_security.middleware import SessionSecurityMiddleware \
    as BaseSessionSecurityMiddleware
from session_security.utils import get_last_activity, set_last_activity
from session_security.settings import EXPIRE_AFTER, PASSIVE_URLS


PASSIVE_HEADER = getattr(settings, 'SESSION_SECURITY_PASSIVE_HEADER', None)
PASSIVE_QUERYSTRING = getattr(
    settings, 'SESSION_SECURITY_PASSIVE_QUERYSTRING', None
)


class SessionSecurityMiddleware(BaseSessionSecurityMiddleware):
    """
    Extends session_security and adds the ability to specify a passive
    request via querystring or header.
    """
    def is_passive_request(self, request):
        if request.path in PASSIVE_URLS:
            return True
        if request.META.get(PASSIVE_HEADER) == '1':
            return True
        if request.REQUEST.get(PASSIVE_QUERYSTRING) == '1':
            return True
        return False

    def process_request(self, request):
        """ Update last activity time or logout. """
        if not request.user.is_authenticated():
            return

        now = datetime.now()
        self.update_last_activity(request, now)

        delta = now - get_last_activity(request.session)
        if delta >= timedelta(seconds=EXPIRE_AFTER):
            logout(request)
        elif not self.is_passive_request(request):
            set_last_activity(request.session, now)

    def process_response(self, request, response):
        if not request.user.is_authenticated():
            return response
        if '_session_security' not in request.session:
            return response

        response['Session-Expires-In'] = get_expires_in(request.session).total_seconds() * 1000
        return response
