# -*- encoding: utf-8 -*-
"Tests for postcode_lookup view"

import contextlib
import json
import unittest

import mock
import postcodeinfo

from legalaid.postcode_lookup_views import no_results_response, \
    postcode_from_url_params, postcode_addresses, \
    addresses_for_postcode_from_url_params, postcode_lookup


postcode = 'sw1a1aa'
valid_addresses = [
    {
        "formatted_address": "Buckingham Palace\nLondon\nSW1A 1AA",
    }
]


@contextlib.contextmanager
def patch_postcodeinfo(postcode, result):
    with mock.patch('postcodeinfo.Client') as Client:
        client = Client.return_value
        lookup = client.lookup_postcode

        if callable(result):
            lookup.side_effect = result
        else:
            lookup.return_value.addresses = result

        yield

        client.assertCalled()
        lookup.assertCalledWith(postcode)


class PostcodeLookupViewsTest(unittest.TestCase):

    def setUp(self):
        self.request = mock.Mock()
        self.request.GET.get.return_value = postcode
        self.request.user.is_authenticated.return_value = True

    def assert_no_results(self, response):
        self.assertEqual(404, response.status_code)
        self.assertEqual('[]', response.content)

    def assert_error(self, response):
        self.assertEqual(500, response.status_code)

    def assert_address_response(self, addresses, response):
        self.assertEqual(200, response.status_code)
        self.assertEqual(json.dumps(addresses), response.content)

    def test_no_results_response(self):
        self.assert_no_results(no_results_response())

    def test_postcode_from_url_params(self):
        self.assertEqual(postcode, postcode_from_url_params(self.request))

    def test_postcode_addresses(self):
        with patch_postcodeinfo(postcode, valid_addresses):
            addresses = postcode_addresses(postcode)
            self.assertEqual(valid_addresses, addresses)

    def test_addresses_for_postcode_from_url_params(self):
        with patch_postcodeinfo(postcode, valid_addresses):
            addresses = addresses_for_postcode_from_url_params(self.request)
            self.assertEqual(valid_addresses, addresses)

    def test_postcode_lookup(self):
        with patch_postcodeinfo(postcode, valid_addresses):
            response = postcode_lookup(self.request, '')
            self.assert_address_response(valid_addresses, response)

    def test_postcode_lookup_no_results(self):

        def raise_exception(*args):
            raise postcodeinfo.NoResults()

        with patch_postcodeinfo(postcode, raise_exception):
            response = postcode_lookup(self.request, '')
            self.assert_no_results(response)

    def test_server_error(self):

        def raise_exception(*args):
            raise postcodeinfo.ServiceUnavailable()

        with patch_postcodeinfo(postcode, raise_exception):
            response = postcode_lookup(self.request, '')
            self.assert_error(response)
