from requests.auth import AuthBase


class BearerTokenAuth(AuthBase):
    """
    Attaches the Bearer token to the request
    """
    def __init__(self, token):
        self.token = token

    def get_header(self):
        return ('Authorization', 'Bearer %s' % self.token)

    def __call__(self, request):
        key, token = self.get_header()
        request.headers[key] = token
        return request
