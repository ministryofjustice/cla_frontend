# import slumber
# from cla_auth.auth_providers import BearerTokenAuth


class ClaUser(object):
    USERNAME_FIELD = 'token'

    # @property
    # def client(self):
    #     if not hasattr(self, '_client'):
    #         self._client = slumber.API(base_url='', auth=BearerTokenAuth(self.pk))

    #     return self._client

    def __init__(self, token):
        self.pk = token

    def save(self, *args, **kwargs):
        # TODO call backend api with last_login ?
        pass

    def is_authenticated(self, *args, **kwargs):
        return True
