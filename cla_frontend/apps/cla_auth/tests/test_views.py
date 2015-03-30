import mock

from slumber.exceptions import HttpClientError

from django.test.testcases import SimpleTestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import SESSION_KEY, BACKEND_SESSION_KEY

from . import base


class LoginTestCase(SimpleTestCase):
    urls = 'cla_auth.tests.urls'

    @mock.patch('cla_auth.backend.get_auth_connection')
    def __call__(self, result,
        mocked_get_auth_connection,
        *args, **kwargs
    ):
        self.mocked_get_auth_connection = mocked_get_auth_connection

        self.credentials = {
            'username': 'my-username',
            'password': 'my-password'
        }
        super(LoginTestCase, self).__call__(result, *args, **kwargs)

    def setUp(self, *args, **kwargs):
        super(LoginTestCase, self).setUp(*args, **kwargs)
        self.url = reverse(u'auth:login')

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertItemsEqual(
            response.context_data['form'].fields.keys(),
            ['username', 'password']
        )

    def test_success(self):
        token = '123456789'
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.return_value = {
            'access_token': token
        }
        self.mocked_get_auth_connection.return_value = connection

        response = self.client.post(self.url, data=self.credentials, follow=True)

        self.assertEqual(response.content, u'logged in')
        self.assertEqual(self.client.session[SESSION_KEY], token)
        self.assertEqual(
            self.client.session[BACKEND_SESSION_KEY],
            base.DEFAULT_ZONE_PROFILE['AUTHENTICATION_BACKEND']
        )

    def test_failure(self):
        connection = mock.MagicMock()
        connection.oauth2.access_token.post.side_effect = HttpClientError(
            content='{"error": "invalid grant"}'
        )
        self.mocked_get_auth_connection.return_value = connection

        response = self.client.post(self.url, data=self.credentials, follow=True)

        self.assertFalse(response.context_data['form'].is_valid())
        self.assertEqual(self.client.session.items(), [])
