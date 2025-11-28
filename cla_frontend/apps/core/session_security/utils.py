from datetime import timedelta, datetime
from session_security.utils import get_last_activity
from django.conf import settings

EXPIRE_AFTER = getattr(settings, "SESSION_SECURITY_EXPIRE_AFTER", 300)


def get_expires_in(session):
    last_activity = get_last_activity(session)
    return (last_activity + timedelta(seconds=EXPIRE_AFTER)) - datetime.now()
