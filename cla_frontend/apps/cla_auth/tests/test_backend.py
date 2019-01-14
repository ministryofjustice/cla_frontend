import mock

from requests import ConnectionError
from slumber.exceptions import HttpClientError

from django.test.testcases import SimpleTestCase
from django.conf import settings

from ..backend import get_backend, ClaBackend

from . import base


class TestClaBackend(ClaBackend):
    zone_name = base.DEFAULT_ZONE_NAME


class GetBackendTestCase(SimpleTestCase):
    """
        Test get_backend without mocking anything
    """

    def test_invalid_zone_name(self):
        backend = get_backend("invalid_zone")
        self.assertEqual(backend, None)

    def test_success(self):
        zone_name = settings.ZONE_PROFILES.keys()[0]
        backend = get_backend(zone_name)

        self.assertTrue(backend)
        self.assertEqual(backend.zone_name, zone_name)
        self.assertTrue(issubclass(backend.__class__, ClaBackend))


class ClaBackendTestCase(SimpleTestCase):
    @mock.patch("cla_auth.backend.get_auth_connection")
    def __call__(self, result, mocked_get_auth_connection, *args, **kwargs):
        self.mocked_get_auth_connection = mocked_get_auth_connection

        self.credentials = {"username": "my-username", "password": "my-password"}
        super(ClaBackendTestCase, self).__call__(result, *args, **kwargs)

    def test_authenticate_invalid_zone(self):
        class InvalidClaBackend(ClaBackend):
            zone_name = "invalid_zone"

        backend = InvalidClaBackend()
        self.assertEqual(backend.authenticate(**self.credentials), None)
        self.assertEqual(self.mocked_get_auth_connection.called, False)

    def test_authenticate_connection_error(self):
        backend = TestClaBackend()

        connection = mock.MagicMock()
        connection.oauth2.access_token.post.side_effect = ConnectionError()
        self.mocked_get_auth_connection.return_value = connection

        self.assertEqual(backend.authenticate(**self.credentials), None)
        self.assertEqual(self.mocked_get_auth_connection.called, True)
        connection.oauth2.access_token.post.assert_called_with(
            {
                "client_id": base.DEFAULT_ZONE_PROFILE["CLIENT_ID"],
                "client_secret": base.DEFAULT_ZONE_PROFILE["CLIENT_SECRET"],
                "grant_type": "password",
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            }
        )

    def test_authenticate_invalid_credentials(self):
        backend = TestClaBackend()
        credentials = {"username": "my-username", "password": "invalid"}

        connection = mock.MagicMock()
        connection.oauth2.access_token.post.side_effect = HttpClientError(content='{"error": "invalid grant"}')
        self.mocked_get_auth_connection.return_value = connection

        self.assertEqual(backend.authenticate(**credentials), None)
        self.assertEqual(self.mocked_get_auth_connection.called, True)
        connection.oauth2.access_token.post.assert_called_with(
            {
                "client_id": base.DEFAULT_ZONE_PROFILE["CLIENT_ID"],
                "client_secret": base.DEFAULT_ZONE_PROFILE["CLIENT_SECRET"],
                "grant_type": "password",
                "username": credentials["username"],
                "password": credentials["password"],
            }
        )

    def test_authenticate_success(self):
        token = "123456789"
        backend = TestClaBackend()

        connection = mock.MagicMock()
        connection.oauth2.access_token.post.return_value = {"access_token": token}
        self.mocked_get_auth_connection.return_value = connection

        user = backend.authenticate(**self.credentials)
        self.assertTrue(user)
        self.assertEqual(user.pk, token)
        self.assertEqual(self.mocked_get_auth_connection.called, True)
        connection.oauth2.access_token.post.assert_called_with(
            {
                "client_id": base.DEFAULT_ZONE_PROFILE["CLIENT_ID"],
                "client_secret": base.DEFAULT_ZONE_PROFILE["CLIENT_SECRET"],
                "grant_type": "password",
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            }
        )
