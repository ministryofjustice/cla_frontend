import mock
from django.test import RequestFactory
from django.test.testcases import SimpleTestCase

from ..middleware import EntraAccessTokenMiddleware


class EntraAccessTokenMiddlewareTestCase(SimpleTestCase):
    def setUp(self):
        self.middleware = EntraAccessTokenMiddleware()
        self.factory = RequestFactory()

    def test_no_user_on_request_skips_without_error(self):
        request = self.factory.get("/")
        self.middleware.process_request(request)

    def test_unauthenticated_user_skips(self):
        request = self.factory.get("/")
        user = mock.Mock()
        user.is_authenticated.return_value = False
        request.user = user

        self.middleware.process_request(request)

        user.is_authenticated.assert_called_once()

    def test_non_entra_user_does_not_get_token_set(self):
        request = self.factory.get("/")
        user = mock.Mock(spec=["is_authenticated", "zone_name"])
        user.is_authenticated.return_value = True
        user.zone_name = "call_centre"
        request.user = user

        with mock.patch("cla_auth.middleware.get_valid_access_token") as mock_get_token:
            self.middleware.process_request(request)

        self.assertFalse(hasattr(user, "entra_access_token"))
        self.assertFalse(mock_get_token.called)

    @mock.patch("cla_auth.middleware.get_valid_access_token", return_value="entra-token-abc")
    def test_entra_user_gets_access_token(self, _mock_get_token):
        request = self.factory.get("/")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_name = "entra"
        request.user = user
        request.session = {}

        self.middleware.process_request(request)

        self.assertEqual(user.entra_access_token, "entra-token-abc")

    @mock.patch("cla_auth.middleware.get_valid_access_token", return_value=None)
    def test_entra_user_with_no_token_gets_none(self, _mock_get_token):
        request = self.factory.get("/")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_name = "entra"
        request.user = user
        request.session = {}

        self.middleware.process_request(request)

        self.assertIsNone(user.entra_access_token)

    @mock.patch("cla_auth.middleware.get_valid_access_token", return_value=None)
    def test_entra_user_with_token_gets_none_if_resolver_returns_none(self, _mock_get_token):
        request = self.factory.get("/")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_name = "entra"
        request.user = user
        request.session = {"entra_token_cache_key": "k"}

        self.middleware.process_request(request)

        self.assertIsNone(user.entra_access_token)
