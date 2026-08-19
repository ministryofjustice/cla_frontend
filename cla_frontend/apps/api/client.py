import slumber
import logging
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils.http import urlencode


logger = logging.getLogger(__name__)


class FormSerializer(slumber.serialize.JsonSerializer):
    key = "form"
    content_types = ["application/x-www-form-urlencoded", "application/json"]

    def dumps(self, data):
        return urlencode(data)


def get_auth_connection():
    s = slumber.serialize.Serializer(default="form", serializers=[FormSerializer()])

    return slumber.API(settings.BACKEND_BASE_URI, serializer=s)


def get_connection(request):
    user = request.user
    zone = request.zone

    if not user or not user.is_authenticated():
        raise PermissionDenied(u"no such user")

    if not zone:
        raise PermissionDenied(u"no such app")

    if getattr(request, "path", "").startswith("/provider/proxy/") or getattr(request, "path", "").startswith(
        "/call_centre/proxy/"
    ):
        logger.info(
            "Building API connection",
            extra={
                "METHOD": getattr(request, "method", None),
                "PATH": getattr(request, "path", None),
                "ZONE_NAME": getattr(user, "zone_name", None),
                "HAS_ENTRA_ACCESS_TOKEN_ATTR": bool(getattr(user, "entra_access_token", None)),
                "HAS_SESSION_ACCESS_TOKEN": bool(request.session.get("entra_access_token")),
                "SESSION_ACCESS_TOKEN_EXPIRES_AT": int(request.session.get("entra_access_token_expires_at", 0) or 0),
            },
        )

    if user.zone_name == "entra" and not getattr(user, "entra_access_token", None):
        logger.warning(
            "Denied API connection for Entra user due to missing access token",
            extra={
                "METHOD": getattr(request, "method", None),
                "PATH": getattr(request, "path", None),
                "HAS_SESSION_CACHE_KEY": bool(request.session.get("entra_token_cache_key")),
                "HAS_SESSION_ACCESS_TOKEN": bool(request.session.get("entra_access_token")),
                "SESSION_ACCESS_TOKEN_EXPIRES_AT": int(request.session.get("entra_access_token_expires_at", 0) or 0),
            },
        )
        raise PermissionDenied(u"no access token for Entra user")

    return user.get_raw_connection()
