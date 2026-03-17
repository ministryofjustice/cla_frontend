import mock
from requests import ConnectionError
from slumber.exceptions import HttpClientError

from django.conf import settings
from django.test.testcases import SimpleTestCase

from ..backend import get_backend, ClaBackend, EntraBackend, EntraTokenDecoder

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
        self.assertTrue(issubclass(backend.__class__, (ClaBackend, EntraBackend)))


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


MOCK_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA"
MOCK_KID = "test-key-id"
MOCK_KEYS = [{"kid": MOCK_KID, "x5c": [MOCK_PUBLIC_KEY]}]


class EntraTokenDecoderPublicKeysTestCase(SimpleTestCase):
    @mock.patch("cla_auth.backend.cache")
    def test_returns_cached_keys_when_available(self, mock_cache):
        # Arrange: the cache returns our mock keys.
        mock_cache.get.return_value = MOCK_KEYS
        decoder = EntraTokenDecoder("some.token.here")
        # Act: access the public_keys property, which should hit the cache and return our mock keys.
        keys = decoder.public_keys
        # Assert
        self.assertEqual(keys, MOCK_KEYS)
        mock_cache.get.assert_called_once_with("entra_public_keys")

    @mock.patch("cla_auth.backend.requests")
    @mock.patch("cla_auth.backend.cache")
    def test_fetches_and_caches_keys_when_not_cached(self, mock_cache, mock_requests):
        # Arrange: cache miss, and the HTTP response returns our mock keys.
        mock_cache.get.return_value = None
        mock_response = mock.MagicMock()
        mock_response.json.return_value = {"keys": MOCK_KEYS}
        mock_requests.get.return_value = mock_response
        # Act: access the public_keys property, which should trigger the fetch and cache logic.
        decoder = EntraTokenDecoder("some.token.here")
        keys = decoder.public_keys
        # Assert
        self.assertEqual(keys, MOCK_KEYS)
        mock_requests.get.assert_called_once_with(decoder.discovery_url)
        mock_cache.set.assert_called_once_with("entra_public_keys", MOCK_KEYS, 86400)


class EntraTokenDecoderGetPublicKeyTestCase(SimpleTestCase):
    @mock.patch("cla_auth.backend.jwt.get_unverified_header")
    @mock.patch("cla_auth.backend.cache")
    def test_returns_x5c_for_matching_kid(self, mock_cache, mock_get_header):
        # Arrange: the cache returns keys, and the token header contains a kid that matches one of the keys.
        mock_cache.get.return_value = MOCK_KEYS
        mock_get_header.return_value = {"kid": MOCK_KID}
        # Act: call get_public_key, which should find the matching key and return its x5c value.
        decoder = EntraTokenDecoder("some.token.here")
        key = decoder.get_public_key()
        # Assert
        self.assertEqual(key, MOCK_PUBLIC_KEY)

    @mock.patch("cla_auth.backend.requests")
    @mock.patch("cla_auth.backend.jwt.get_unverified_header")
    @mock.patch("cla_auth.backend.cache")
    def test_retries_after_cache_miss_for_unknown_kid(self, mock_cache, mock_get_header, mock_requests):
        # Arrange: the cache first returns keys that do not match the token's kid, then returns None to trigger a refresh.
        # The HTTP response returns our mock keys.
        mock_cache.get.side_effect = [
            [{"kid": "other-kid", "x5c": ["other-key"]}],
            None,
        ]
        mock_get_header.return_value = {"kid": MOCK_KID}
        mock_response = mock.MagicMock()
        mock_response.json.return_value = {"keys": MOCK_KEYS}
        mock_requests.get.return_value = mock_response
        # Act: call get_public_key, which should first fail to find the key, then refresh the cache and succeed.
        decoder = EntraTokenDecoder("some.token.here")
        key = decoder.get_public_key()
        # Assert
        self.assertEqual(key, MOCK_PUBLIC_KEY)
        mock_cache.delete.assert_called_once_with("entra_public_keys")


class EntraTokenDecoderDecodeTestCase(SimpleTestCase):
    @mock.patch("cla_auth.backend.jwt.decode")
    @mock.patch("cla_auth.backend.load_pem_x509_certificate")
    @mock.patch.object(EntraTokenDecoder, "get_public_key", return_value=MOCK_PUBLIC_KEY)
    def test_returns_decoded_payload_on_success(self, _mock_get_key, _mock_load_cert, mock_jwt_decode):
        # Arrange: jwt.decode returns a valid payload when called with the correct public key.
        expected_payload = {
            "preferred_username": "user@example.com",
            "APP_ROLES": ["Civil Legal Advice - Helpline Operator"],
        }
        mock_jwt_decode.return_value = expected_payload
        # Act: call decode, which should use the mocked get_public_key and jwt.decode to return the expected payload.
        decoder = EntraTokenDecoder("some.token.here")
        result = decoder.decode()
        # Assert
        self.assertEqual(result, expected_payload)

    @mock.patch("cla_auth.backend.jwt.decode", side_effect=Exception("invalid token"))
    @mock.patch("cla_auth.backend.load_pem_x509_certificate")
    @mock.patch.object(EntraTokenDecoder, "get_public_key", return_value=MOCK_PUBLIC_KEY)
    def test_returns_none_on_decode_error(self, _mock_get_key, _mock_load_cert, _mock_jwt_decode):
        # Arrange: jwt.decode raises an exception (e.g. due to an invalid token or signature).
        decoder = EntraTokenDecoder("some.token.here")
        # Act: call decode, which should catch the exception and return None.
        result = decoder.decode()
        # Assert
        self.assertIsNone(result)


class EntraBackendTestCase(SimpleTestCase):
    def setUp(self):
        self.backend = EntraBackend()
        self.mock_jwt = "header.payload.signature"

    @mock.patch("cla_auth.backend.EntraTokenDecoder")
    def test_token_to_user_returns_none_when_decode_fails(self, mock_decoder_cls):
        # Arrange: the decoder's decode method returns None, simulating a decode failure.
        mock_decoder_cls.return_value.decode.return_value = None
        # Act: call token_to_user, which should return None when decoding fails.
        result = self.backend.token_to_user(self.mock_jwt)
        # Assert
        self.assertIsNone(result)

    @mock.patch("cla_auth.backend.EntraTokenDecoder")
    def test_token_to_user_builds_user_from_valid_payload(self, mock_decoder_cls):
        # Arrange: the decoder's decode method returns a valid payload with a username and roles.
        role = "Civil Legal Advice - Helpline Operator"
        mock_decoder_cls.return_value.decode.return_value = {
            "preferred_username": "operator@example.com",
            "APP_ROLES": [role],
        }
        # Act: call token_to_user, which should create a user object with the decoded data.
        user = self.backend.token_to_user(self.mock_jwt)
        # Assert
        self.assertIsNotNone(user)
        self.assertEqual(user._me_data["username"], "operator@example.com")
        self.assertEqual(user._me_data["roles"], [role])
        self.assertFalse(user._me_data["is_manager"])
        self.assertEqual(user._me_data["ui_access"], ["operator"])

    @mock.patch("cla_auth.backend.EntraTokenDecoder")
    def test_token_to_user_sets_is_manager_for_manager_role(self, mock_decoder_cls):
        # Arrange: the decoder's decode method returns a payload with a manager role.
        role = "Civil Legal Advice - Helpline Operator Manager"
        mock_decoder_cls.return_value.decode.return_value = {
            "preferred_username": "manager@example.com",
            "APP_ROLES": [role],
        }
        # Act
        user = self.backend.token_to_user(self.mock_jwt)
        # Assert
        self.assertTrue(user._me_data["is_manager"])

    @mock.patch("cla_auth.backend.EntraTokenDecoder")
    def test_token_to_user_filters_out_unknown_roles(self, mock_decoder_cls):
        # Arrange
        mock_decoder_cls.return_value.decode.return_value = {
            "preferred_username": "user@example.com",
            "APP_ROLES": ["Civil Legal Advice - Helpline Operator", "Unknown Role"],
        }
        # Act
        user = self.backend.token_to_user(self.mock_jwt)
        # Assert
        self.assertEqual(user._me_data["roles"], ["Civil Legal Advice - Helpline Operator"])

    @mock.patch("cla_auth.backend.EntraTokenDecoder")
    def test_token_to_user_handles_single_role_string(self, mock_decoder_cls):
        # Arrange
        role = "Civil Legal Advice - Helpline Operator"
        mock_decoder_cls.return_value.decode.return_value = {
            "preferred_username": "user@example.com",
            "APP_ROLES": role,
        }
        # Act
        user = self.backend.token_to_user(self.mock_jwt)
        # Assert
        self.assertEqual(user._me_data["roles"], [role])

    @mock.patch.object(EntraBackend, "token_to_user")
    def test_authenticate_passes_access_token(self, mock_token_to_user):
        # Arrange
        mock_token_to_user.return_value = mock.MagicMock()
        token_dict = {"access_token": self.mock_jwt}
        # Act
        self.backend.authenticate(token_dict)
        # Assert
        mock_token_to_user.assert_called_once_with(self.mock_jwt)

    @mock.patch.object(EntraBackend, "token_to_user")
    def test_get_user_passes_token(self, mock_token_to_user):
        # Arrange
        mock_token_to_user.return_value = mock.MagicMock()
        # Act
        self.backend.get_user(self.mock_jwt)

        mock_token_to_user.assert_called_once_with(self.mock_jwt)
