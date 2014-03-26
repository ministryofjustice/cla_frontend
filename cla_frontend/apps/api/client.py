from django.utils.functional import curry
import slumber
import urllib

from django.conf import settings


# API_VERSION = 'v1'
# BASE_URI = '{base_uri}/checker/api/{version}'.\
#     format(base_uri=settings.BACKEND_BASE_URI, version=API_VERSION)

# def get_connection(session=None):
#     return slumber.API(BASE_URI, session=session)


# connection = slumber.API(BASE_URI)
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


def get_connection(app, request):
    user = request.user
    if user:
        base_url = settings.BACKEND_BASE_URI

        if app == 'call_centre':
            cc_api_uri = '/call_centre/api/v1/'
            return slumber.API(base_url=base_url + cc_api_uri, auth=BearerTokenAuth(user.pk))
        elif app == 'cla_provider':
            provider_api_uri = '/call_centre/api/v1/'
            return slumber.API(base_url=base_url + provider_api_uri, auth=BearerTokenAuth(user.pk))
    else:
        raise ValueError('no user')

    raise ValueError('no such app')

get_provider_connection = curry(get_connection, 'cla_provider')

get_call_centre_connection = curry(get_connection, 'call_centre')
