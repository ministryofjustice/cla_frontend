import mock

from django.core.urlresolvers import reverse
from django.conf import settings

from slumber.exceptions import HttpClientError

from core.testing.test_base import CLATFrontEndTestCase

from cla_auth.models import ClaUser


class LegalHelpFormTestCase(CLATFrontEndTestCase):
    zone = 'cla_provider'

    @mock.patch('cla_provider.views.get_connection')
    def __call__(self, result, mocked_get_connection, *args, **kwargs):
        self.mocked_get_connection = mocked_get_connection()
        self.mocked_extract = self.mocked_get_connection.case('case_ref').legal_help_form_extract
        super(LegalHelpFormTestCase, self).__call__(result, *args, **kwargs)

    def setUp(self, *args, **kwargs):
        super(LegalHelpFormTestCase, self).setUp(*args, **kwargs)

        self.url = self.get_url('case_ref')

    def get_url(self, case_reference):
        return reverse(
            u'%s:legal_help_form' % self.zone,
            kwargs={
                'case_reference': case_reference
            }
        )

    def assertExtractEqual(self, response, eligibility_check, personal_details):
        self.assertDictEqual(response.context['eligibility_check'], eligibility_check)
        self.assertDictEqual(response.context['personal_details'], personal_details)

    def test_not_logged_in(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 302)
        expected_url = u"%s?next=%s" % (reverse(settings.LOGIN_URL), self.url)
        self.assertRedirects(response, expected_url)

    def test_4xx_5xx(self):
        self.login()

        for status in [404, 403, 400, 500]:
            self.mocked_extract.get.side_effect = HttpClientError(
                response=mock.MagicMock(
                    status_code=status
                )
            )
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status)

    def test_empty_case(self):
        self.login()

        self.mocked_extract.get.return_value = {
            'eligibility_check': {
                'calculations': {}
            },
            'personal_details': {}
        }

        response = self.client.get(self.url)
        self.assertExtractEqual(
            response,
            {'additional_SMOD_property': None, 'main_property': None, 'calculations': {}, 'additional_non_SMOD_property': None},
            {}
        )

    def test_with_properties(self):
        self.login()

        data = {
            'eligibility_check': {
                'property_set': [
                    {
                        "value": 10000000,
                        "mortgage_left": 1000000,
                        "share": 100,
                        "id": 5,
                        "disputed": True,
                        "main": True
                    },
                    {
                        "value": 1111100,
                        "mortgage_left": 11100,
                        "share": 100,
                        "id": 6,
                        "disputed": False,
                        "main": False
                    },
                    {
                        "value": 2222200,
                        "mortgage_left": 33270,
                        "share": 80,
                        "id": 7,
                        "disputed": True,
                        "main": False
                    }
                ],
                'calculations': {
                    "partner_allowance": 0,
                    "pensioner_disregard": 10000000,
                    "gross_income": 0,
                    "partner_employment_allowance": 0,
                    "disposable_income": 0,
                    "property_capital": 1851144,
                    "dependants_allowance": 0,
                    "disposable_capital_assets": 0,
                    "property_equities": [
                        0,
                        1100000,
                        751144
                    ],
                    "employment_allowance": 0,
                    "liquid_capital": 3600000
                }
            },
            'personal_details': {}
        }
        self.mocked_extract.get.return_value = data

        response = self.client.get(self.url)

        main_property = dict(data['eligibility_check']['property_set'][0])
        main_property['equity'] = 0

        additional_SMOD_property = dict(data['eligibility_check']['property_set'][2])
        additional_SMOD_property['equity'] = 751144

        additional_non_SMOD_property = dict(data['eligibility_check']['property_set'][1])
        additional_non_SMOD_property['equity'] = 1100000
        self.assertExtractEqual(
            response,
            {
                'main_property': main_property,
                'additional_SMOD_property': additional_SMOD_property,
                'additional_non_SMOD_property': additional_non_SMOD_property,
                'property_set': data['eligibility_check']['property_set'],
                'calculations': data['eligibility_check']['calculations'],
            },
            {}
        )

    def test_with_properties_without_equities(self):
        self.login()

        data = {
            'eligibility_check': {
                'property_set': [
                    {
                        "value": 10000000,
                        "mortgage_left": 1000000,
                        "share": 100,
                        "id": 5,
                        "disputed": True,
                        "main": True
                    },
                    {
                        "value": 1111100,
                        "mortgage_left": 11100,
                        "share": 100,
                        "id": 6,
                        "disputed": False,
                        "main": False
                    },
                    {
                        "value": 2222200,
                        "mortgage_left": 33270,
                        "share": 80,
                        "id": 7,
                        "disputed": True,
                        "main": False
                    }
                ],
                'calculations': {
                    "partner_allowance": 0,
                    "pensioner_disregard": 10000000,
                    "gross_income": 0,
                    "partner_employment_allowance": 0,
                    "disposable_income": 0,
                    "property_capital": 1851144,
                    "dependants_allowance": 0,
                    "disposable_capital_assets": 0,
                    "property_equities": [],
                    "employment_allowance": 0,
                    "liquid_capital": 3600000
                }
            },
            'personal_details': {}
        }
        self.mocked_extract.get.return_value = data

        response = self.client.get(self.url)

        main_property = dict(data['eligibility_check']['property_set'][0])
        main_property['equity'] = 0

        additional_SMOD_property = dict(data['eligibility_check']['property_set'][2])
        additional_SMOD_property['equity'] = 0

        additional_non_SMOD_property = dict(data['eligibility_check']['property_set'][1])
        additional_non_SMOD_property['equity'] = 0
        self.assertExtractEqual(
            response,
            {
                'main_property': main_property,
                'additional_SMOD_property': additional_SMOD_property,
                'additional_non_SMOD_property': additional_non_SMOD_property,
                'property_set': data['eligibility_check']['property_set'],
                'calculations': data['eligibility_check']['calculations'],
            },
            {}
        )
