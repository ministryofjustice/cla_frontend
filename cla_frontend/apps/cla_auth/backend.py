import sys
import json
import logging
from requests import ConnectionError
from slumber.exceptions import HttpClientError

from django.conf import settings

from api.client import get_auth_connection

from .models import ClaUser
from .utils import get_auth_profile

logger = logging.getLogger(__name__)


class ClaBackend(object):
    """
    """
    auth_app = None

    def authenticate(self, username=None, password=None):
        auth_profile = get_auth_profile(self.auth_app)
        if not auth_profile:
            return None

        connection = get_auth_connection()
        response = None
        try:
            response = connection.oauth2.access_token.post({
                'client_id': auth_profile['CLIENT_ID'],
                'client_secret': auth_profile['CLIENT_SECRET'],
                'grant_type': 'password',
                'username': username,
                'password': password
            })
        except ConnectionError as conerr:
            # the server is down
            pass
        except HttpClientError as hcerr:
            error = json.loads(hcerr.content)
            error = error.get('error')
            if error == u'invalid_client':
                # the client is invalid log it
                "Client used to authenticate with backend is invalid. {}: {}".format(hcerr, error)
                logger.error(hcerr.message)
                return
            elif error == u'invalid_grant':
                # the password was wrong - just return None
                return

        user = ClaUser(response['access_token'])
        return user

    def get_user(self, token):
        return ClaUser(token)


def to_camelcase(string):
    class_ = string.__class__
    return class_.join('', map(class_.capitalize, string.split('_')))


backends = []

for auth_app in settings.AUTH_APPS_PROFILES:
    backend_name = '%sBackend' % to_camelcase(auth_app)
    backendClazz = type(backend_name, (ClaBackend,), {
        'auth_app': auth_app
    })
    setattr(sys.modules[__name__], backendClazz.__name__, backendClazz)

    backends.append(backendClazz)


def get_backend_class(auth_app):
    for backendClazz in backends:
        if backendClazz.auth_app == auth_app:
            return backendClazz
    return None
