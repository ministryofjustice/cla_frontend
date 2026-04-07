import mock
from django.test.testcases import SimpleTestCase

from ..models import ClaUser


class ClaUserTestCase(SimpleTestCase):
    def setUp(self):
        self.token = "123456789"

    def test_pk_as_token(self):
        user = ClaUser(token=self.token, zone_name="zone_name")
        self.assertEqual(user.pk, self.token)

    def test_save_doesnt_do_anything(self):
        user = ClaUser(token=self.token, zone_name="zone_name")
        user.save()

    def test_is_authenticated_always_returns_true(self):
        user = ClaUser(token=self.token, zone_name="zone_name")
        self.assertTrue(user.is_authenticated())


class ClaUserZoneToUiTestCase(SimpleTestCase):
    def test_call_centre_returns_operator(self):
        user = ClaUser(token="token", zone_name="call_centre")
        self.assertEqual(user.zone_to_ui(), ["operator"])

    def test_cla_provider_returns_provider(self):
        user = ClaUser(token="token", zone_name="cla_provider")
        self.assertEqual(user.zone_to_ui(), ["provider"])

    def test_entra_returns_ui_access_from_data(self):
        user = ClaUser(token="token", zone_name="entra")
        user._me_data = {"ui_access": ["operator"]}
        self.assertEqual(user.zone_to_ui(), ["operator"])

    def test_entra_returns_multiple_ui_access(self):
        user = ClaUser(token="token", zone_name="entra")
        user._me_data = {"ui_access": ["operator", "provider"]}
        self.assertEqual(user.zone_to_ui(), ["operator", "provider"])

    def test_entra_returns_empty_list_when_no_ui_access(self):
        user = ClaUser(token="token", zone_name="entra")
        user._me_data = {}
        self.assertEqual(user.zone_to_ui(), [])


class ClaUserEntraGetRawConnectionTestCase(SimpleTestCase):
    def setUp(self):
        self.user = ClaUser(token="token", zone_name="entra")
        self.user.entra_access_token = "entra-token"

    @mock.patch("cla_auth.models.slumber.API")
    @mock.patch("cla_auth.models.get_zone_profile")
    def test_uses_entra_access_token_and_correct_base_url(self, mock_get_zone_profile, mock_api):
        self.user._me_data = {"ui_access": ["operator"]}
        mock_get_zone_profile.return_value = {
            "BASE_URI": {"operator": "https://operator.svc", "provider": "https://provider.svc"}
        }

        self.user._entra_get_raw_connection()

        mock_api.assert_called_once_with(base_url="https://operator.svc", auth=mock.ANY)
        _, kwargs = mock_api.call_args
        self.assertEqual(kwargs["auth"].token, "entra-token")

    @mock.patch("cla_auth.models.slumber.API")
    @mock.patch("cla_auth.models.get_zone_profile")
    def test_uses_first_ui_when_user_has_multiple_roles(self, mock_get_zone_profile, mock_api):
        self.user._me_data = {"ui_access": ["operator", "provider"]}
        mock_get_zone_profile.return_value = {
            "BASE_URI": {"operator": "https://operator.svc", "provider": "https://provider.svc"}
        }

        self.user._entra_get_raw_connection()

        mock_api.assert_called_once_with(base_url="https://operator.svc", auth=mock.ANY)

    @mock.patch("cla_auth.models.get_zone_profile")
    def test_raises_index_error_when_ui_access_is_empty(self, mock_get_zone_profile):
        self.user._me_data = {}
        mock_get_zone_profile.return_value = {"BASE_URI": {"operator": "https://operator.svc"}}

        with self.assertRaises(ValueError):
            self.user._entra_get_raw_connection()
