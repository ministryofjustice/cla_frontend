import random
import mock

from django.core.urlresolvers import reverse
from django.test import SimpleTestCase

from core.testing.test_base import CLATFrontEndTestCase
from cla_auth.backend import ClaBackend
from cla_auth.models import ClaUser

from .fixtures import mocked_api
from ..backend import CallCentreBackend
from ..views import dashboard


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
        self.mocked_get_connection().case.get.assert_called_with()
        self.assertEqual(response.status_code, 200)

        for case in mocked_api.CASE_LIST:
            self.assertContains(response, case.get('reference'))

    def test_dashboard_get_search_cases(self):
        response = self.client.get(self.dashboard_url,
            data={'q':'foo'}
        )

        args, kwargs = self.mocked_get_connection.call_args
        request = args[0]
        self.assertTrue('q' in request.GET)
        self.assertEqual(u'foo', request.GET.get('q'))
        self.assertEqual(response.status_code, 200)

        self.mocked_get_connection().case.get.assert_called_with(search='foo')

        for case in mocked_api.CASE_LIST[0:2]:
            self.assertContains(response, case.get('reference'))
