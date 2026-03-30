import mock

from slumber.exceptions import HttpClientError

from django.test.testcases import SimpleTestCase
from django.test import override_settings, RequestFactory
from cla_auth.views import EntraAuthView
from django.core.urlresolvers import reverse
from django.contrib.auth import REDIRECT_FIELD_NAME, SESSION_KEY, BACKEND_SESSION_KEY

from . import base


class LoginTestCase(SimpleTestCase):
    urls = "cla_auth.tests.urls"

    @mock.patch("cla_auth.backend.get_auth_connection")
    @override_settings(USERS_ALLOWED_ENTRA_ACCESS=[], USE_LEGACY_AUTH="True")
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
        resp = self.client.post(self.url, data={"step": "username", "username": self.credentials["username"]})
        self.assertEqual(resp.status_code, 200)

        # Step 2: password form
        response = self.client.post(
            self.url,
            data={
                "step": "password",
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            },
            follow=True,
        )

        self.assertEqual(response.content, "logged in")
        self.assertEqual(self.client.session[SESSION_KEY], token)
        self.assertEqual(self.client.session[BACKEND_SESSION_KEY], base.DEFAULT_ZONE_PROFILE["AUTHENTICATION_BACKEND"])

    def test_failure(self):
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.side_effect = HttpClientError(content='{"error": "invalid grant"}')
        self.mocked_get_auth_connection.return_value = connection

        # Step 1: username form
        self.client.post(self.url, data={"step": "username", "username": self.credentials["username"]})

        # Step 2: password form
        response = self.client.post(
            self.url,
            data={
                "step": "password",
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            },
            follow=True,
        )

        self.assertFalse(response.context_data["form"].is_valid())
        self.assertNotIn(SESSION_KEY, self.client.session)

    def test_empty_username_shows_username_form_error(self):
        # Submitting an empty username should return the username form with errors
        response = self.client.post(self.url, data={"step": "username", "username": ""})

        self.assertEqual(response.status_code, 200)
        form = response.context_data["form"]
        self.assertIn("username", form.fields)
        self.assertIn("username", form.errors)
        self.assertNotIn("password", form.fields)

    def test_stale_session_username_submit_rerenders_username_form(self):
        self.client.post(self.url, data={"step": "username", "username": "old-username"})

        response = self.client.post(
            self.url, data={"step": "username", "username": self.credentials["username"]}, follow=True
        )

        self.assertEqual(response.status_code, 200)
        form = response.context_data["form"]

        self.assertIn("password", form.fields)

    def test_browser_back_with_new_username_updates_session(self):
        token = "123456789"
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.return_value = {"access_token": token}
        self.mocked_get_auth_connection.return_value = connection

        # First username submission
        self.client.post(self.url, data={"ste": "username", "username": "old-username"})

        # Simulate browser back: POST username field again with a new username
        self.client.post(self.url, data={"step": "username", "username": self.credentials["username"]})

        # Password step should now authenticate with the new username
        response = self.client.post(
            self.url,
            data={
                "step": "password",
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            },
            follow=True,
        )
        self.assertEqual(response.content, "logged in")


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
        self.client.post(self.login_url, data={"step": "username", "username": self.credentials["username"]})
        self.client.post(
            self.login_url,
            data={
                "step": "password",
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            },
        )
        return token

    @override_settings(USE_LEGACY_AUTH="True")
    def test_logout_clears_session(self):
        self._login()
        self.assertTrue(self.client.session.items())
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


@mock.patch("cla_auth.backend.get_auth_connection")
@override_settings(USE_LEGACY_AUTH="True")
class EntraRouteCallBackTestCase(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.mock_msal_app = mock.Mock()
        patcher = mock.patch.object(EntraAuthView, "build_msal_app", return_value=self.mock_msal_app)
        self.mock_build_msal_app = patcher.start()
        self.addCleanup(patcher.stop)  # stops the patch after each test automatically

    def _make_request(self, params=None, session=None):
        # Helper so every test doesn't repeat GET request + session setup
        request = self.factory.get("/callback/", params or {})
        request.session = session or {"oauth_state": "test-state"}
        return request

    def test_missing_code_redirects_to_root(self, _):
        request = self._make_request(params={"state": "test-state"})
        response = EntraAuthView.route_call_back(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "/")

    def test_missing_state_redirects_to_root(self, _):
        request = self._make_request(params={"code": "some-code"})
        response = EntraAuthView.route_call_back(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "/")

    def test_state_mismatch_redirects_to_root(self, _):
        request = self._make_request(
            params={"code": "some-code", "state": "wrong-state"},
            session={"oauth_state": "test-state"},
        )
        response = EntraAuthView.route_call_back(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "/")

    def test_msal_error_redirects_to_root(self, _):
        self.mock_msal_app.acquire_token_by_authorization_code.return_value = {"error": "invalid_grant"}
        request = self._make_request(params={"code": "some-code", "state": "test-state"})
        response = EntraAuthView.route_call_back(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "/")

    @mock.patch("cla_auth.views.authenticate", return_value=None)
    def test_authenticate_returns_none_redirects_to_root(self, _, __):
        self.mock_msal_app.acquire_token_by_authorization_code.return_value = {"access_token": "tok", "id_token": "id"}
        request = self._make_request(params={"code": "some-code", "state": "test-state"})
        response = EntraAuthView.route_call_back(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "/")

    @mock.patch("cla_auth.views.auth_login")
    @mock.patch("cla_auth.views.authenticate")
    def test_successful_auth_operator_redirects_to_call_centre(self, mock_authenticate, _, __):
        mock_user = mock.Mock()
        mock_user.zone_to_ui.return_value = ["operator"]
        mock_authenticate.return_value = mock_user
        self.mock_msal_app.acquire_token_by_authorization_code.return_value = {"access_token": "tok", "id_token": "id"}

        request = self._make_request(params={"code": "some-code", "state": "test-state"})
        response = EntraAuthView.route_call_back(request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/call_centre", response["Location"])
        self.assertEqual(request.session.get("entra_access_token"), "tok")

    @mock.patch("cla_auth.views.auth_login")
    @mock.patch("cla_auth.views.authenticate")
    def test_successful_auth_provider_redirects_to_provider(self, mock_authenticate, _, __):
        mock_user = mock.Mock()
        mock_user.zone_to_ui.return_value = ["provider"]
        mock_authenticate.return_value = mock_user
        self.mock_msal_app.acquire_token_by_authorization_code.return_value = {"access_token": "tok", "id_token": "id"}

        request = self._make_request(params={"code": "some-code", "state": "test-state"})
        response = EntraAuthView.route_call_back(request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/provider", response["Location"])

    @mock.patch("cla_auth.views.auth_login")
    @mock.patch("cla_auth.views.authenticate")
    def test_next_url_in_session_is_used_and_deleted(self, mock_authenticate, _, __):
        mock_user = mock.Mock()
        mock_user.zone_to_ui.return_value = ["operator"]
        mock_authenticate.return_value = mock_user
        self.mock_msal_app.acquire_token_by_authorization_code.return_value = {"access_token": "tok", "id_token": "id"}

        request = self._make_request(
            params={"code": "some-code", "state": "test-state"},
            session={"oauth_state": "test-state", REDIRECT_FIELD_NAME: "/some/next/url"},
        )
        response = EntraAuthView.route_call_back(request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/some/next/url", response["Location"])
        self.assertNotIn(REDIRECT_FIELD_NAME, request.session)
