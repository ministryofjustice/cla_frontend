import mock

from django.test import testcases
from core.exceptions import RemoteValidationError

from legalaid.tests import test_forms

from ..forms import CaseAssignForm, CaseCloseForm, EligibilityCheckForm, \
    PersonalDetailsForm

BLANK_CHOICE = [('', '----')]


class CaseAssignFormTest(testcases.SimpleTestCase):
    def setUp(self):
        super(CaseAssignFormTest, self).setUp()

        self.client = mock.MagicMock()
        self.providers = [
            {'id': 1, 'name': 'provider1'},
            {'id': 2, 'name': 'provider2'},
            {'id': 111, 'name': 'provider2'},
        ]


    def test_provider_with_none_is_valid(self):
        form = CaseAssignForm(client=self.client, data={})
        self.assertTrue(form.is_valid())

    def test_save(self):
        case_reference = '1234567890'

        form = CaseAssignForm(client=self.client, data={})
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).assign().post.assert_called_once_with()


    def test_save_with_no_providers_for_category(self):
        case_reference = '999999'
        self.client.case(case_reference).assign().post.return_value = \
            { "__all__": [
                    "There is no provider specified in the system to handle cases of this law category." ]}
        form = CaseAssignForm(client=self.client, data={})
        self.assertTrue(form.is_valid())
        self.client.case(case_reference).assign().post.assert_called_once_with()
        self.assertFalse(form.is_valid())
        nfe = form.non_field_errors()
        self.assertEqual(len(nfe),1)




class CaseCloseFormTest(testcases.SimpleTestCase):
    def setUp(self):
        super(CaseCloseFormTest, self).setUp()

        self.client = mock.MagicMock()

    def test_save(self):
        case_reference = '1234567890'

        data = {}
        form = CaseCloseForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).close().post.assert_called_with(data)



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

class EligibilityCheckFormTest(test_forms.APIFormMixinTest):

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

