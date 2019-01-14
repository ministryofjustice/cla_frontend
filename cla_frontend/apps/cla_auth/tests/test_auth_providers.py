import mock

from django.test.testcases import SimpleTestCase

from ..auth_providers import BearerTokenAuth


class BearerTokenAuthTestCase(SimpleTestCase):
    def test_with_token(self):
        token = "123456789"

        auth = BearerTokenAuth(token)

        request = mock.MagicMock(headers={})
        resp = auth(request)

        self.assertEqual(resp.headers, {"Authorization": "Bearer 123456789"})
