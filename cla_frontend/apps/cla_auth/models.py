from cla_auth.utils import get_zone_profile

from slumber.exceptions import HttpClientError

from api.client import get_raw_connection


class ClaUser(object):
    USERNAME_FIELD = 'token'

    def __init__(self, token, zone_name):
        self.pk = token
        self.zone_name = zone_name
        self.is_locked_out = False
        self.is_active = True

    def save(self, *args, **kwargs):
        # TODO call backend api with last_login ?
        pass

    def is_authenticated(self, *args, **kwargs):
        return True

    @property
    def _data(self):
        if not hasattr(self, '_me_data'):
            try:
                zone_profile = get_zone_profile(self.zone_name)
                client = get_raw_connection(self.pk, zone_profile)

                self._me_data = client.user.me.get()
            except HttpClientError:
                self._me_data = {}
        return self._me_data

    @property
    def is_manager(self):
        return self._data.get('is_manager')

    @property
    def username(self):
        return self._data.get('username')
