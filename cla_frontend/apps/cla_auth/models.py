from cla_auth.utils import get_zone_profile

from api.client import get_raw_connection


class ClaUser(object):
    USERNAME_FIELD = 'token'

    def __init__(self, token, zone_name):
        self.pk = token
        self.zone_name = zone_name
        self.is_locked_out = False

    def save(self, *args, **kwargs):
        # TODO call backend api with last_login ?
        pass

    def is_authenticated(self, *args, **kwargs):
        return True

    @property
    def _data(self):
        if not hasattr(self, '_me_data'):
            zone_profile = get_zone_profile(self.zone_name)
            client = get_raw_connection(self.pk, zone_profile)

            self._me_data = client.user.me.get()
        return self._me_data

    @property
    def is_manager(self):
        return self._data['is_manager']

    @property
    def username(self):
        return self._data['username']
