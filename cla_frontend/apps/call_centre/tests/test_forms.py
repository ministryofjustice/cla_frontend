from cla_common import constants
from django.forms.forms import Form
import mock

from django.test import testcases
from ..forms import CaseAssignForm, CaseCloseForm, APIFormMixin, \
EligibilityCheckForm, PersonalDetailsForm

BLANK_CHOICE = [('', '----')]


class APIFormMixinTest(testcases.SimpleTestCase):

    formclass = None
    class TestForm(APIFormMixin, Form):
        pass

    def _get_test_form(self):
        if self.formclass:
            return self.formclass
        return self.TestForm

    def test_form_pops_client(self):
        client = mock.MagicMock()
        f = self.TestForm(client=client)
        self.assertTrue(hasattr(f, 'client'))

    def test_form_error_if_no_client_kwarg(self):
        with self.assertRaises(KeyError):
            f = self.TestForm(notclient=mock.MagicMock())

    def test_form_rejects_bad_kwarg(self):
        with self.assertRaises(TypeError):
            f = self.TestForm(client=mock.MagicMock(), foo='bar')


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
        self.client.provider.get.return_value = self.providers

    def test_choices(self):
        expected = BLANK_CHOICE + [(x['id'], x['name']) for x in self.providers]
        form = CaseAssignForm(client=self.client)
        self.assertItemsEqual(form.fields['provider'].choices, expected)

    def test_provider_with_none_is_invalid(self):
        form = CaseAssignForm(client=self.client, data={'provider': ''})
        self.assertFalse(form.is_valid())
        self.assertItemsEqual(form.errors, {'provider': [u'This field is required.']})


    def test_provider_invalid_provider_is_invalid(self):
        form = CaseAssignForm(client=self.client, data={'provider': 121})
        self.assertFalse(form.is_valid())
        self.assertDictEqual(form.errors,
                             {'provider': [u'Select a valid choice. 121 is not one of the available choices.']})

    def test_provider_valid_provider_is_valid(self):
        form = CaseAssignForm(client=self.client, data={'provider': 111})
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors,
                             {})


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

