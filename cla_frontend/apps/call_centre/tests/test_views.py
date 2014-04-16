from django.core.urlresolvers import reverse
from django.test import SimpleTestCase
import mock

from .fixtures import mocked_api

from ..views import dashboard


class CLATFrontEndTestCase(SimpleTestCase):
    @mock.patch('call_centre.views.get_connection')
    def __call__(self, result, mocked_connection, *args, **kwargs):
        self.mocked_connection = mocked_connection

        super(CLATFrontEndTestCase, self).__call__(result, *args, **kwargs)

class ProviderDashboardTests(CLATFrontEndTestCase):

    def test_dashboard_gets_all_cases(self):
        print 'aaaa'