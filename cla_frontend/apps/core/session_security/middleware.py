from datetime import datetime, timedelta

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
    def is_passive_request(self, request):
        if request.path in PASSIVE_URLS:
            return True
        if PASSIVE_HEADER and request.META.get(PASSIVE_HEADER, False):
            return True
        if PASSIVE_QUERYSTRING and request.REQUEST.get(PASSIVE_QUERYSTRING, False):
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
