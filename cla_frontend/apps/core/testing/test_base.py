from django.core.urlresolvers import reverse
from django.test import SimpleTestCase
import mock


class CLATFrontEndTestCase(SimpleTestCase):
    zone = None
    credentials = {
        'username': 'my-username',
        'password': 'my-password'
    }

    def login(self):
        resp = self.client.post(self.login_url, data=self.credentials, follow=True)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(self.mocked_get_auth_connection.called)

    @mock.patch('cla_auth.forms.get_available_zone_names')
    @mock.patch('cla_auth.backend.get_auth_connection')
    def __call__(self, result, mocked_get_auth_connection, mocked_get_available_zone_names, *args, **kwargs):
        self.mocked_get_available_zone_names = mocked_get_available_zone_names
        self.mocked_get_available_zone_names.return_value = [self.zone]
        self.mocked_get_auth_connection = mocked_get_auth_connection

        token = '123456789'
        # Login
        auth_connection = mock.MagicMock()
        auth_connection.oauth2.access_token.post.return_value = {
            'access_token': token
        }
        self.mocked_get_auth_connection.return_value = auth_connection

        self.login_url = reverse('auth:login')

        super(CLATFrontEndTestCase, self).__call__(result, *args, **kwargs)
