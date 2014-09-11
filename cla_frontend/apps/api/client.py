import slumber

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils.http import urlencode

from cla_auth.auth_providers import BearerTokenAuth


class FormSerializer(slumber.serialize.JsonSerializer):
    key = "form"
    content_types = ["application/x-www-form-urlencoded", "application/json"]

    def dumps(self, data):
        return urlencode(data)


def get_auth_connection():
    s = slumber.serialize.Serializer(
        default="form",
        serializers=[
            FormSerializer(),
        ]
    )

    return slumber.API(settings.BACKEND_BASE_URI, serializer=s)


def get_connection(request):
    user = request.user
    zone = request.zone

    if not user:
        raise PermissionDenied(u'no such user')

    if not zone:
        raise PermissionDenied(u'no such app')

    return get_raw_connection(user.pk, zone)


def get_raw_connection(token, zone):
    return slumber.API(base_url=zone['BASE_URI'], auth=BearerTokenAuth(token))
