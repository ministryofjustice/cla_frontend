import mock

from django.forms.forms import Form
from django.test import testcases

from cla_common import constants

from legalaid.tests.test_forms import APIFormMixinTest

from ..forms import CaseAssignForm, CaseCloseForm, APIFormMixin, \
EligibilityCheckForm, PersonalDetailsForm

BLANK_CHOICE = [('', '----')]


class CaseCloseFormTest(testcases.SimpleTestCase):

    def test_reason_with_none_is_invalid(self):
        form = CaseCloseForm(data={'reason': ''})
        self.assertFalse(form.is_valid())
        self.assertDictEqual(form.errors, {'reason': [u'This field is required.']})


    def test_reason_invalid_reason_is_invalid(self):
        form = CaseCloseForm(data={'reason': 111})
        self.assertFalse(form.is_valid())
        self.assertDictEqual(form.errors,
                     {'reason': [u'Select a valid choice. 111 is not one of the available choices.']})

    def test_reason_valid_reason_is_valid(self):
        form = CaseCloseForm(data={'reason': constants.CASE_STATE_REJECTED})
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors, {})


class CaseAssignFormTest(APIFormMixinTest):

    def setUp(self):
        self.client = mock.MagicMock()
        self.providers = [
            {'id': 1, 'name': 'provider1'},
            {'id': 2, 'name': 'provider2'},
            {'id': 111, 'name': 'provider2'},
        ]
        self.outcome_codes = [
            {'code': 'AAA', 'description': 'aaa'},
            {'code': 'BBB', 'description': 'bbb'},
        ]
        self.client.provider.get.return_value = self.providers
        self.client.outcome_code.get.return_value = self.outcome_codes

    def test_choices(self):
        providers_expected = BLANK_CHOICE + [(x['id'], x['name']) for x in self.providers]
        outcome_codes_expected = tuple(
            (x['code'], u'%s - %s' % (x['code'], x['description'])) for x in self.outcome_codes
        )

        form = CaseAssignForm(client=self.client)
        self.assertItemsEqual(form.fields['provider'].choices, providers_expected)
        self.assertItemsEqual(form.fields['outcome_code'].choices, outcome_codes_expected)

    def test_provider_with_none_is_invalid(self):
        form = CaseAssignForm(client=self.client, data={})
        self.assertFalse(form.is_valid())
        self.assertItemsEqual(form.errors, {
            'provider': [u'This field is required.'],
            'outcome_code': [u'This field is required.'],
        })

    def _get_default_post_data(self, data={}):
        default_data = {
            'provider': self.providers[0]['id'],
            'outcome_code': self.outcome_codes[0]['code'],
            'outcome_notes': 'lorem ipsum'
        }
        default_data.update(data)
        return default_data

    def test_invalid_if_provider_is_invalid(self):
        data = self._get_default_post_data({
            'provider': 121
        })
        form = CaseAssignForm(client=self.client, data=data)
        self.assertFalse(form.is_valid())
        self.assertDictEqual(
            form.errors,
            {'provider': [u'Select a valid choice. 121 is not one of the available choices.']
        })

    def test_invalid_if_outcome_code_is_invalid(self):
        data = self._get_default_post_data({
            'outcome_code': 'invalid'
        })
        form = CaseAssignForm(client=self.client, data=data)
        self.assertFalse(form.is_valid())
        self.assertDictEqual(
            form.errors,
            {'outcome_code': [u'Select a valid choice. invalid is not one of the available choices.']
        })

    def test_is_valid_True(self):
        data = self._get_default_post_data()
        form = CaseAssignForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors, {})

    def test_save(self):
        case_reference = '1234567890'

        data = self._get_default_post_data()
        form = CaseAssignForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).assign().post.assert_called_with(data)


class PersonalDetailsFormTests(testcases.SimpleTestCase):

    default_data = {
        "title": 'mr',
        "full_name": 'John Doe',
        "postcode": 'SW1H 9AJ',
        "street": '102 Petty France',
        "town": 'London',
        }

    def test_contact_required_validation_only_mobile_valid(self):
        data = self.default_data.copy()
        data.update({
            'mobile_phone': '123'
        })

        f = PersonalDetailsForm(data=data)
        self.assertTrue(f.is_valid())
        self.assertDictEqual(f.errors, {})

    def test_contact_required_validation_only_home_valid(self):
        data = self.default_data.copy()
        data.update({
            'home_phone': '123'
        })

        f = PersonalDetailsForm(data=data)
        self.assertTrue(f.is_valid())
        self.assertDictEqual(f.errors, {})

    def test_contact_required_validation_no_number_invalid(self):
        f = PersonalDetailsForm(data=self.default_data)
        self.assertFalse(f.is_valid())
        self.assertDictEqual(
            f.errors,
            {'mobile_phone':
                 [u'You must specify at least one contact number.']})

class EligibilityCheckFormTest(APIFormMixinTest):

    formclass = EligibilityCheckForm
    default_data = {
        'notes':'hello',
        'state': 1
    }

    def setUp(self):
        self.client = mock.MagicMock()
        self.categories = [
            {'id': 1, 'name': 'category1', 'code': 'foo1'},
            {'id': 2, 'name': 'category2', 'code': 'foo2'},
            {'id': 111, 'name': 'category2', 'code': 'foo3'},
            ]
        self.client.category.get.return_value = self.categories

    def test_choices(self):
        expected = [(x['code'], x['name']) for x in self.categories]
        form = EligibilityCheckForm(client=self.client)
        self.assertItemsEqual(form.fields['category'].choices, expected)

    def test_category_with_none_is_invalid(self):
        data = self.default_data.copy()
        data.update({
            'category': ''
        })
        form = EligibilityCheckForm(client=self.client, data=data)
        self.assertFalse(form.is_valid())
        self.assertItemsEqual(form.errors, {'category': [u'This field is required.']})


    def test_category_invalid_category_is_invalid(self):
        data = self.default_data.copy()
        data.update({
            'category': '121'
        })
        form = EligibilityCheckForm(client=self.client, data=data)

        self.assertFalse(form.is_valid())
        self.assertDictEqual(form.errors,
                             {'category': [u'Select a valid choice. 121 is not one of the available choices.']})

    def test_category_valid_category_is_valid(self):
        data = self.default_data.copy()
        data.update({
            'category': 'foo3'
        })
        form = EligibilityCheckForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors,
            {})

