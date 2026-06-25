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
        request.session = {"entra_access_token": "some-token"}

        self.middleware.process_request(request)

        self.assertFalse(hasattr(user, "entra_access_token"))

    def test_entra_user_gets_access_token_from_session(self):
        request = self.factory.get("/")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_name = "entra"
        request.user = user
        request.session = {"entra_access_token": "entra-token-abc"}

        self.middleware.process_request(request)

        self.assertEqual(user.entra_access_token, "entra-token-abc")

    def test_entra_user_with_no_token_in_session_gets_none(self):
        request = self.factory.get("/")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_name = "entra"
        request.user = user
        request.session = {}

        self.middleware.process_request(request)

        self.assertIsNone(user.entra_access_token)
