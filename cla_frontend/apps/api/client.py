import slumber
import urllib

from django.conf import settings

from cla_auth.auth_providers import BearerTokenAuth


class FormSerializer(slumber.serialize.JsonSerializer):
    key = "form"
    content_types = ["application/x-www-form-urlencoded", "application/json"]

    def dumps(self, data):
        return urllib.urlencode(data)


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
        raise ValueError(u'no such user')

    if not zone:
        raise ValueError(u'no such app')

    return slumber.API(base_url=zone['BASE_URI'], auth=BearerTokenAuth(user.pk))
