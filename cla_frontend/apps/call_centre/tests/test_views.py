import random
from django.core.urlresolvers import reverse
from django.test import SimpleTestCase
import mock
from call_centre.backend import CallCentreBackend
from cla_auth.backend import ClaBackend
from cla_auth.models import ClaUser

from .fixtures import mocked_api
from ..views import dashboard


class CLATFrontEndTestCase(SimpleTestCase):

    zone = None
    credentials = { 'username': 'my-username', 'password': 'my-password' }

    def login(self):
        resp = self.client.post(self.login_url, data=self.credentials, follow=True)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(self.mocked_get_auth_connection.called)

    @mock.patch('cla_auth.backend.get_auth_connection')
    def __call__(self, result, mocked_get_auth_connection, *args, **kwargs):
        self.mocked_get_auth_connection = mocked_get_auth_connection
        token = '123456789'
        ### Login
        auth_connection = mock.MagicMock()
        auth_connection.oauth2.access_token.post.return_value = {
            'access_token': token
        }
        self.mocked_get_auth_connection.return_value = auth_connection

        self.login_url = reverse('%s:login' % self.zone)


        super(CLATFrontEndTestCase, self).__call__(result, *args, **kwargs)

class CallCentreDashboardTests(CLATFrontEndTestCase):

    zone = 'call_centre'

    @mock.patch('call_centre.views.get_connection')
    def __call__(self, result, mocked_get_connection, *args, **kwargs):
        self.mocked_get_connection = mocked_get_connection
        
        ### Mock API
        connection = mock.MagicMock()
        connection.case.get.return_value = mocked_api.CASE_LIST
        self.mocked_get_connection.return_value = connection


        super(CallCentreDashboardTests, self).__call__(result, *args, **kwargs)

    def setUp(self):
        self.dashboard_url = reverse('call_centre:dashboard')
        self.login()


    def test_dashboard_get_all_cases(self):
        response = self.client.get(self.dashboard_url)
        self.assertTrue(self.mocked_get_connection.called)
        self.assertEqual(response.status_code, 200)
        for case in mocked_api.CASE_LIST:
            self.assertContains(response, case.get('reference'))

    def test_dashboard_get_search_cases(self):
        response = self.client.get(self.dashboard_url)
        self.assertTrue(self.mocked_get_connection.called)
        self.assertEqual(response.status_code, 200)
        for case in mocked_api.CASE_LIST:
            self.assertContains(response, case.get('reference'))
