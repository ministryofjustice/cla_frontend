import slumber
from cla_auth.utils import get_zone_profile
from cla_auth.auth_providers import BearerTokenAuth
from slumber.exceptions import HttpClientError


class ClaUser(object):
    USERNAME_FIELD = "token"

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
        if not hasattr(self, "_me_data"):
            try:
                client = self.get_raw_connection()
                self._me_data = client.user.me.get()
            except HttpClientError:
                self._me_data = {}
        return self._me_data

    @property
    def is_manager(self):
        return self._data.get("is_manager")

    @property
    def username(self):
        return self._data.get("username")

    @property
    def ui_access(self):
        if self.zone_name == "call_centre":
            return ["operator"]
        if self.zone_name == "cla_provider":
            return ["provider"]
        return self._data.get("ui_access", [])

    def get_raw_connection(self):
        if self.zone_name == "entra":
            return self._entra_get_raw_connection()
        else:
            return self._legacy_get_raw_connection()

    def _legacy_get_raw_connection(self):
        zone = get_zone_profile(self.zone_name)
        return slumber.API(base_url=zone["BASE_URI"], auth=BearerTokenAuth(self.pk))

    def _entra_get_raw_connection(self):
        ui = self.ui_access[0]
        zone = get_zone_profile(self.zone_name)
        base_url = zone["BASE_URI"][ui]
        return slumber.API(base_url=base_url, auth=BearerTokenAuth(self.pk))
