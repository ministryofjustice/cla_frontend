import mock

from django.core.exceptions import PermissionDenied
from django.test.testcases import SimpleTestCase
from django.contrib.auth import BACKEND_SESSION_KEY
from django.conf import settings

from .. import authenticate, get_zone


class AuthenticateTestCase(SimpleTestCase):
    @mock.patch("cla_auth.user_login_failed")
    @mock.patch("cla_auth.get_backend")
    def __call__(self, result, mocked_get_backend, mocked_user_login_failed, *args, **kwargs):
        self.mocked_get_backend = mocked_get_backend
        self.mocked_user_login_failed = mocked_user_login_failed

        self.zone_name = "test_zone"
        self.credentials = {"username": "my-username", "password": "my-password"}
        super(AuthenticateTestCase, self).__call__(result, *args, **kwargs)

    def invalid_backend(self):
        # mocked get_backend
        self.mocked_get_backend.return_value = None

        user = authenticate(self.zone_name, **self.credentials)

        # asserts
        self.assertEqual(user, None)
        self.mocked_get_backend.assert_called_with(self.zone_name)
        self.assertEqual(self.mocked_user_login_failed.called, False)

    def test_permission_denied(self):
        # mocked backend - authenticate => PermissionDenied
        mock_backend = mock.MagicMock()
        mock_backend.authenticate.side_effect = PermissionDenied

        # mocked get_backend
        self.mocked_get_backend.return_value = mock_backend

        user = authenticate(self.zone_name, **self.credentials)

        # asserts
        self.assertEqual(user, None)
        self.mocked_get_backend.assert_called_with(self.zone_name)
        mock_backend.authenticate.assert_called_with(**self.credentials)

        self.assertEqual(self.mocked_user_login_failed.send.called, True)

    def test_credentials_invalid_format(self):
        # mocked backend - authenticate => TypeError
        mock_backend = mock.MagicMock()
        mock_backend.authenticate.side_effect = TypeError

        # mocked get_backend
        self.mocked_get_backend.return_value = mock_backend

        user = authenticate(self.zone_name, **self.credentials)

        # asserts
        self.assertEqual(user, None)
        self.mocked_get_backend.assert_called_with(self.zone_name)
        mock_backend.authenticate.assert_called_with(**self.credentials)

        self.assertEqual(self.mocked_user_login_failed.send.called, True)

    def test_success(self):
        # mocked user
        mocked_user = mock.MagicMock()

        # mocked backend - authenticate => mocked_user
        mock_backend = mock.MagicMock()
        mock_backend.authenticate.return_value = mocked_user

        # mocked get_backend
        self.mocked_get_backend.return_value = mock_backend

        user = authenticate(self.zone_name, **self.credentials)

        # asserts
        self.assertEqual(user, mocked_user)
        self.mocked_get_backend.assert_called_with(self.zone_name)
        mock_backend.authenticate.assert_called_with(**self.credentials)

        self.assertEqual(self.mocked_user_login_failed.send.called, False)
        self.assertEqual(user.backend, "mock.MagicMock")

    def test_invalid_credentials(self):
        # mocked backend - authenticate => None
        mock_backend = mock.MagicMock()
        mock_backend.authenticate.return_value = None

        # mocked get_backend
        self.mocked_get_backend.return_value = mock_backend

        user = authenticate(self.zone_name, **self.credentials)

        # asserts
        self.assertEqual(user, None)
        self.mocked_get_backend.assert_called_with(self.zone_name)
        mock_backend.authenticate.assert_called_with(**self.credentials)

        self.assertEqual(self.mocked_user_login_failed.send.called, True)


class GetZoneTestCase(SimpleTestCase):
    @mock.patch("cla_auth.load_backend")
    def __call__(self, result, mocked_load_backend, *args, **kwargs):
        self.mocked_load_backend = mocked_load_backend

        super(GetZoneTestCase, self).__call__(result, *args, **kwargs)

    def test_backend_not_in_available_ones(self):
        request = mock.MagicMock(session={BACKEND_SESSION_KEY: "invalid.backend"})
        self.assertEqual(get_zone(request), None)
        self.assertEqual(self.mocked_load_backend.called, False)

    def test_no_backend_in_the_session(self):
        request = mock.MagicMock(session={})
        self.assertEqual(get_zone(request), None)
        self.assertEqual(self.mocked_load_backend.called, False)

    def test_success(self):
        # using real load_backend, could have used mocks but better here to
        # use the real one, just in case
        from django.contrib.auth import load_backend

        self.mocked_load_backend.side_effect = load_backend

        zone_profile = settings.ZONE_PROFILES.values()[0]
        zone_profile["name"] = settings.ZONE_PROFILES.keys()[0]
        request = mock.MagicMock(session={BACKEND_SESSION_KEY: zone_profile["AUTHENTICATION_BACKEND"]})
        self.assertEqual(get_zone(request), zone_profile)
        self.assertEqual(self.mocked_load_backend.called, True)
