import mock

from django.core.urlresolvers import reverse
from django.conf import settings

from core.testing.test_base import CLATFrontEndTestCase


class RotaTests(CLATFrontEndTestCase):

    zone = 'call_centre'

    @mock.patch('cla_auth.models.get_raw_connection')
    def __call__(self, result, mocked_get_raw_connection, *args, **kwargs):
        self.mocked_get_raw_connection = mocked_get_raw_connection

        self.connection = mock.MagicMock()

        # Mock get_raw_connection API
        self.connection.user.me.get.return_value = {
            "username": "test_operator",
            "first_name": "",
            "last_name": "",
            "email": "",
            "is_manager": False
        }
        self.mocked_get_raw_connection.return_value = self.connection

        super(RotaTests, self).__call__(result, *args, **kwargs)

    def setUp(self):
        self.rota_url = reverse('call_centre:admin:rota')
        super(RotaTests, self).setUp()

    def test_get_not_logged_in(self):
        response = self.client.get(self.rota_url, follow=True)

        expected_url = u"%s?next=%s" % (reverse(settings.LOGIN_URL), self.rota_url)
        self.assertRedirects(response, expected_url)

    def test_get_logged_in_not_manager(self):
        self.login()

        self.connection.user.me.get.return_value['is_manager'] = False

        response = self.client.get(self.rota_url, follow=True)
        self.assertEqual(response.status_code, 404)

    def test_get_logged_in_manager(self):
        self.login()

        self.connection.user.me.get.return_value['is_manager'] = True

        response = self.client.get(self.rota_url, follow=True)
        self.assertEqual(response.status_code, 200)
