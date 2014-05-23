import json
import logging
from requests import ConnectionError
from slumber.exceptions import HttpClientError

from django.contrib.auth import load_backend

from api.client import get_auth_connection, get_raw_connection

from .models import ClaUser
from .utils import get_zone_profile

logger = logging.getLogger(__name__)


class ClaBackend(object):
    """
    """
    zone_name = None

    def authenticate(self, username=None, password=None):
        zone_profile = self.get_this_zone_profile()
        if not zone_profile:
            return None

        connection = get_auth_connection()
        response = None
        try:
            response = connection.oauth2.access_token.post({
                'client_id': zone_profile['CLIENT_ID'],
                'client_secret': zone_profile['CLIENT_SECRET'],
                'grant_type': 'password',
                'username': username,
                'password': password
            })
        except ConnectionError as conerr:
            # the server is down
            return
        except HttpClientError as hcerr:
            error = json.loads(hcerr.content)
            error = error.get('error')
            if error == u'invalid_client':
                # the client is invalid log it
                "Client used to authenticate with backend is invalid. {}: {}".format(hcerr, error)
                logger.error(hcerr.message)
            return

        user = ClaUser(response['access_token'])
        return user

    def get_user(self, token):
        zone_profile = self.get_this_zone_profile()
        client = get_raw_connection(token, zone_profile)

        profile_data = client.user.me.get()
        return ClaUser(token, **profile_data)

    def get_this_zone_profile(self):
        return get_zone_profile(self.zone_name)


def get_backend(zone_name):
    zone_profile = get_zone_profile(zone_name)
    if not zone_profile:
        return None

    backend_path = zone_profile['AUTHENTICATION_BACKEND']
    backendClazz = load_backend(backend_path)
    return backendClazz
