import json
from requests import ConnectionError
import logging
from django.conf import settings
from slumber.exceptions import HttpClientError

from api.client import get_auth_connection

from .models import ClaUser

logger = logging.getLogger(__name__)

class ClaBackend(object):
    """
    """
    def authenticate(self, username=None, password=None):

        connection = get_auth_connection()
        response = None
        try:
            response = connection.oauth2.access_token.post({
                'client_id': settings.AUTH_CLIENT_ID,
                'client_secret': settings.AUTH_CLIENT_SECRET,
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
