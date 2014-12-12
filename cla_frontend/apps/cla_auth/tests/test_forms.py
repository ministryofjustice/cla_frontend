import mock

from django.test.testcases import SimpleTestCase
from django.utils.encoding import force_text
from django.conf import settings
from django.core.urlresolvers import reverse

from ..forms import AuthenticationForm


class AuthenticationFormTest(SimpleTestCase):
    @mock.patch('cla_auth.forms.authenticate')
    def __call__(self, result, mocked_authenticate, *args, **kwargs):
        self.mocked_authenticate = mocked_authenticate

        self.zone_name = 'test_zone'
        super(AuthenticationFormTest, self).__call__(result, *args, **kwargs)

    def test_invalid_user(self):
        # The user submits an invalid username.

        self.mocked_authenticate.return_value = None

        data = {
            'username': 'jsmith_does_not_exist',
            'password': 'test123',
        }

        form = AuthenticationForm(None, zone_name=self.zone_name, data=data)

        self.assertFalse(form.is_valid())
        self.assertEqual(form.non_field_errors(),
                [force_text(form.error_messages['invalid_login'] % {
                   'username': u'username'
                })])

        self.mocked_authenticate.assert_called_with(self.zone_name, **data)

    def test_success(self):
        # The success case

        self.mocked_authenticate.return_value = mock.MagicMock(
            is_locked_out=False
        )

        data = {
            'username': 'testclient',
            'password': 'password',
        }

        form = AuthenticationForm(None, zone_name=self.zone_name, data=data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.non_field_errors(), [])

        self.mocked_authenticate.assert_called_with(self.zone_name, **data)

    def test_locked_out(self):
        self.mocked_authenticate.return_value = mock.MagicMock(
            is_locked_out=True
        )

        data = {
            'username': 'testclient',
            'password': 'password',
        }

        form = AuthenticationForm(None, zone_name=self.zone_name, data=data)
        self.assertFalse(form.is_valid())
        self.assertEqual(
            form.non_field_errors(),
            [u'Account locked: too many login attempts. Please try again later or contact your Manager.']
        )

    def test_inactive(self):
        self.mocked_authenticate.return_value = mock.MagicMock(
            is_locked_out=False, is_active=False
        )

        data = {
            'username': 'testclient',
            'password': 'password',
        }

        form = AuthenticationForm(None, zone_name=self.zone_name, data=data)
        self.assertFalse(form.is_valid())
        self.assertEqual(
            form.non_field_errors(),
            [u'Account disabled, please contact your supervisor.']
        )

    def test_get_login_redirect_url_invalid_zone(self):
        form = AuthenticationForm(None, zone_name='invalid')

        self.assertEqual(form.get_login_redirect_url(), None)

    def test_get_login_redirect_url_valid_zone(self):
        zone_name = settings.ZONE_PROFILES.keys()[0]
        zone_profile = settings.ZONE_PROFILES[zone_name]

        form = AuthenticationForm(None, zone_name=settings.ZONE_PROFILES.keys()[0])

        self.assertEqual(
            form.get_login_redirect_url(),
            reverse(zone_profile['LOGIN_REDIRECT_URL'])
        )
