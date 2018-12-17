# coding=utf-8
import json

import mock
from core.testing.test_base import CLATFrontEndTestCase
from django.test import RequestFactory
from legalaid.postcode_lookup_views import postcode_lookup


class PostcodeLookupViewsTest(CLATFrontEndTestCase):
    def setUp(self):
        self.request = RequestFactory().get("")
        self.request.user = mock.MagicMock()
        self.lookup_method_name = "cla_common.address_lookup.ordnance_survey.FormattedAddressLookup.by_postcode"

    def test_response_packaging(self):
        prerecorded_result = "Ministry of Justice\n52 Queen Annes Gate\nLondon\nSW1H 9AG"
        expected_formatted_result = json.dumps([{"formatted_address": prerecorded_result}])
        with mock.patch(self.lookup_method_name) as mock_method:
            mock_method.return_value = [prerecorded_result]
            response = postcode_lookup(self.request, "")
            self.assertEqual(expected_formatted_result, response.content)

    def test_no_results_status(self):
        expected_formatted_result = json.dumps([])
        with mock.patch(self.lookup_method_name) as mock_method:
            mock_method.return_value = []
            response = postcode_lookup(self.request, "")
            self.assertEqual(expected_formatted_result, response.content)
            self.assertEquals(404, response.status_code)
