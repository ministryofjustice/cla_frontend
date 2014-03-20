import slumber
import urllib

from django.conf import settings


# API_VERSION = 'v1'
# BASE_URI = '{base_uri}/checker/api/{version}'.\
#     format(base_uri=settings.BACKEND_BASE_URI, version=API_VERSION)

# def get_connection(session=None):
#     return slumber.API(BASE_URI, session=session)


# connection = slumber.API(BASE_URI)


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
