import mock

from slumber.exceptions import HttpClientError

from django.test.testcases import SimpleTestCase
from django.test import override_settings
from django.core.urlresolvers import reverse
from django.contrib.auth import SESSION_KEY, BACKEND_SESSION_KEY

from . import base


class LoginTestCase(SimpleTestCase):
    urls = "cla_auth.tests.urls"

    @mock.patch("cla_auth.backend.get_auth_connection")
    @override_settings(USERS_ALLOWED_ENTRA_ACCESS=[])
    def __call__(self, result, mocked_get_auth_connection, *args, **kwargs):
        self.mocked_get_auth_connection = mocked_get_auth_connection

        self.credentials = {"username": "my-username", "password": "my-password"}
        super(LoginTestCase, self).__call__(result, *args, **kwargs)

    def setUp(self, *args, **kwargs):
        super(LoginTestCase, self).setUp(*args, **kwargs)
        self.url = reverse("auth:login")

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertItemsEqual(response.context_data["form"].fields.keys(), ["username"])

    def test_success(self):
        token = "123456789"
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.return_value = {"access_token": token}
        self.mocked_get_auth_connection.return_value = connection

        # Step 1: username form
        self.client.post(self.url, data={"username": self.credentials["username"]})

        # Step 2: password form
        response = self.client.post(self.url, data={"password": self.credentials["password"]}, follow=True)

        self.assertEqual(response.content, "logged in")
        self.assertEqual(self.client.session[SESSION_KEY], token)
        self.assertEqual(self.client.session[BACKEND_SESSION_KEY], base.DEFAULT_ZONE_PROFILE["AUTHENTICATION_BACKEND"])

    def test_failure(self):
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.side_effect = HttpClientError(content='{"error": "invalid grant"}')
        self.mocked_get_auth_connection.return_value = connection

        # Step 1: username form
        self.client.post(self.url, data={"username": self.credentials["username"]})

        # Step 2: password form
        response = self.client.post(self.url, data={"password": self.credentials["password"]}, follow=True)

        self.assertFalse(response.context_data["form"].is_valid())
        self.assertNotIn(SESSION_KEY, self.client.session)


class LegacyLogoutTestCase(SimpleTestCase):
    urls = "cla_auth.tests.urls"

    @mock.patch("cla_auth.backend.get_auth_connection")
    @override_settings(USE_LEGACY_AUTH="True")
    def __call__(self, result, mocked_get_auth_connection, *args, **kwargs):
        self.mocked_get_auth_connection = mocked_get_auth_connection
        self.credentials = {"username": "my-username", "password": "my-password"}
        super(LegacyLogoutTestCase, self).__call__(result, *args, **kwargs)

    def setUp(self, *args, **kwargs):
        super(LegacyLogoutTestCase, self).setUp(*args, **kwargs)
        self.login_url = reverse("auth:login")
        self.logout_url = reverse("auth:logout")

    def _login(self):
        token = "123456789"
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.return_value = {"access_token": token}
        self.mocked_get_auth_connection.return_value = connection
        self.client.post(self.login_url, data={"username": self.credentials["username"]})
        self.client.post(self.login_url, data={"password": self.credentials["password"]})
        return token

    @override_settings(USE_LEGACY_AUTH="True")
    def test_logout_clears_session(self):
        self._login()
        self.assertTrue(self.client.session.items())  # confirm logged in
        self.client.get(self.logout_url, follow=True)
        self.assertEqual(self.client.session.items(), [])

    @override_settings(USE_LEGACY_AUTH="True")
    def test_logout_redirects_to_login(self):
        self._login()
        response = self.client.get(self.logout_url)
        self.assertEqual(response.status_code, 302)
        self.assertIn("/", response.url)


class EntraLogoutTestCase(SimpleTestCase):
    urls = "cla_auth.tests.urls"
    test_tenant = "00000000-0000-0000-0000-000000000000"
    entra_url = "https://login.microsoftonline.com/" + test_tenant

    def setUp(self, *args, **kwargs):
        super(EntraLogoutTestCase, self).setUp(*args, **kwargs)
        self.logout_url = reverse("auth:logout")
        self.entra_user = mock.MagicMock()
        self.entra_user.is_authenticated.return_value = True
        self.entra_user.zone_name = "entra"

    @override_settings(ENTRA_AUTHORITY=entra_url)
    def test_logout_redirects_to_entra(self):
        with mock.patch("cla_auth.views.logout"), mock.patch(
            "django.contrib.auth.middleware.get_user", return_value=self.entra_user
        ):
            response = self.client.get(self.logout_url)
        self.assertEqual(response.status_code, 302)
        self.assertIn(self.entra_url, response["Location"])

    @override_settings(ENTRA_AUTHORITY=entra_url)
    def test_logout_clears_cookie(self):
        with mock.patch("cla_auth.views.logout"), mock.patch(
            "django.contrib.auth.middleware.get_user", return_value=self.entra_user
        ):
            response = self.client.get(self.logout_url)
        self.assertIn("set-cookie", response._headers)
        self.assertIn("Max-Age=0", response._headers["set-cookie"][1])
