import mock
from django.test.testcases import SimpleTestCase
from django.conf import settings
from django.core.urlresolvers import reverse

from ..forms import UsernameForm, PasswordForm


class UsernameFormTest(SimpleTestCase):
    def test_valid_username(self):
        form = UsernameForm(data={"username": "test-username"})
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["username"], "test-username")

    def test_empty_username_is_invalid(self):
        form = UsernameForm(data={"username": ""})
        self.assertFalse(form.is_valid())
        self.assertIn("username", form.errors)


class PasswordFormTest(SimpleTestCase):
    def setUp(self):
        self.username = "my-user"
        self.password = "my-password"
        self.zone_name = "test_zone"

    @mock.patch("cla_auth.forms.authenticate")
    def test_valid_credentials_authenticates_user(self, mock_auth):
        mock_user = mock.MagicMock(is_locked_out=False, is_active=True)
        mock_auth.return_value = mock_user

        form = PasswordForm(username=self.username, zone_names=[self.zone_name], data={"password": self.password})
        self.assertTrue(form.is_valid())
        self.assertEqual(form.get_user(), mock_user)
        mock_auth.assert_called_with(self.zone_name, username=self.username, password=self.password)

    @mock.patch("cla_auth.forms.authenticate")
    def test_invalid_credentials_raises_error(self, mock_auth):
        mock_auth.return_value = None

        form = PasswordForm(username=self.username, zone_names=[self.zone_name], data={"password": self.password})
        self.assertFalse(form.is_valid())
        self.assertIn(
            "Please enter a correct username and password. Note that both fields may be case-sensitive.",
            form.non_field_errors(),
        )

    @mock.patch("cla_auth.forms.authenticate")
    def test_locked_out_user_raises_error(self, mock_auth):
        mock_auth.return_value = mock.MagicMock(is_locked_out=True)

        form = PasswordForm(username=self.username, zone_names=[self.zone_name], data={"password": self.password})
        self.assertFalse(form.is_valid())
        self.assertIn(
            "Account locked: too many login attempts. Please try again later or contact your Manager.",
            form.non_field_errors(),
        )

    @mock.patch("cla_auth.forms.authenticate")
    def test_inactive_user_raises_error(self, mock_auth):
        mock_auth.return_value = mock.MagicMock(is_locked_out=False, is_active=False)

        form = PasswordForm(username=self.username, zone_names=[self.zone_name], data={"password": self.password})
        self.assertFalse(form.is_valid())
        self.assertIn("Account disabled, please contact your supervisor.", form.non_field_errors())

    @mock.patch("cla_auth.forms.authenticate")
    def test_no_username_skips_authentication(self, mock_auth):
        form = PasswordForm(username=None, zone_names=[self.zone_name], data={"password": self.password})
        self.assertTrue(form.is_valid())
        mock_auth.assert_not_called()

    def test_get_login_redirect_url_valid_zone(self):
        zone_name = settings.ZONE_PROFILES.keys()[0]
        zone_profile = settings.ZONE_PROFILES[zone_name]

        form = PasswordForm(username=self.username, zone_names=[zone_name])
        form.current_zone_name = zone_name
        self.assertEqual(form.get_login_redirect_url(), reverse(zone_profile["LOGIN_REDIRECT_URL"]))

    def test_get_login_redirect_url_invalid_zone(self):
        form = PasswordForm(username=self.username, zone_names=["invalid"])
        form.current_zone_name = "invalid"
        self.assertIsNone(form.get_login_redirect_url())
