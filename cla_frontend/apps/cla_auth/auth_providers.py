from requests.auth import AuthBase


class BearerTokenAuth(AuthBase):
    """
    Attaches the Bearer token to the request
    """
    def __init__(self, token):
        self.token = token

    def __call__(self, request):
        request.headers['Authorization'] = 'Bearer %s' % self.token
        return request
