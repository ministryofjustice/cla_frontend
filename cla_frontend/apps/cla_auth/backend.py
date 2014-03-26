import json
import logging
from requests import ConnectionError
from slumber.exceptions import HttpClientError
from django.conf import settings
from django.core.urlresolvers import reverse

from api.client import get_auth_connection

from .models import ClaUser

logger = logging.getLogger(__name__)


class ClaBackend(object):
    """
    """

    def authenticate(self, username=None, password=None, auth_app=None):
        auth_profile = settings.AUTH_APPS_PROFILES.get(auth_app)

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

    def get_login_redirect_url(self, auth_app):
        auth_profile = settings.AUTH_APPS_PROFILES.get(auth_app)
        return reverse(auth_profile['LOGIN_REDIRECT_URL'])


# import sys
# for name in ['ClaProviderBackend']:
#     backend = type(name, (), {})
#     setattr(sys.modules[__name__], backend.__name__, backend)
