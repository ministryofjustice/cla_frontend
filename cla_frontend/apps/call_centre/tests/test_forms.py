import mock
from slumber.exceptions import HttpClientError

from django.test import testcases

from core.exceptions import RemoteValidationError

from cla_common.constants import ELIGIBILITY_STATES

from legalaid.tests import test_forms

from ..forms import CaseAssignForm, CaseCloseForm, EligibilityCheckForm, \
    PersonalDetailsForm, SearchCaseForm, CaseNotesForm, CaseForm

BLANK_CHOICE = [('', '----')]


class SearchCaseFormTestCase(test_forms.APIFormMixinTest):
    form_class = SearchCaseForm

    def setUp(self):
        super(SearchCaseFormTestCase, self).setUp()
        self.expected_value = mock.MagicMock()

        self._client.case.get.return_value = self.expected_value

    def test_search_without_q(self):
        form = SearchCaseForm(client=self._client)
        result = form.search()

        self.assertEqual(result, self.expected_value)
        self._client.case.get.assert_called_with()

    def test_search_with_q(self):
        form = SearchCaseForm(client=self._client)
        result = form.search(q='foo')

        self.assertEqual(result, self.expected_value)
        self._client.case.get.assert_called_with(search='foo')


class CaseNotesFormTestCase(test_forms.APIFormMixinTest):
    form_class = CaseNotesForm
    default_data = {
        'notes': 'lorem ipsum',
        'in_scope': True
    }

    def test_save(self):
        data = self.default_data.copy()

        f = CaseNotesForm(data=data, client=self._client)
        self.assertTrue(f.is_valid())

        # saving
        case_reference = 'case_ref'
        f.save(case_reference)

        self._client.case(case_reference).patch.called_with(data)


class EligibilityCheckFormTestCase(test_forms.APIFormMixinTest):
    formclass = EligibilityCheckForm
    default_data = {
        'notes':'hello',
        'state': ELIGIBILITY_STATES.MAYBE,
        'category': 'foo1'
    }

    def setUp(self):
        super(EligibilityCheckFormTestCase, self).setUp()

        self.categories = [
            {'id': 1, 'name': 'category1', 'code': 'foo1'},
            {'id': 2, 'name': 'category2', 'code': 'foo2'},
            {'id': 111, 'name': 'category2', 'code': 'foo3'},
        ]
        self._client.category.get.return_value = self.categories

    def test_choices(self):
        expected = [(x['code'], x['name']) for x in self.categories]
        form = EligibilityCheckForm(client=self._client)
        self.assertItemsEqual(form.fields['category'].choices, expected)

    def test_category_with_none_is_invalid(self):
        data = self.default_data.copy()
        data.update({
            'category': ''
        })
        form = EligibilityCheckForm(client=self._client, data=data)
        self.assertFalse(form.is_valid())
        self.assertItemsEqual(form.errors, {'category': [u'This field is required.']})

    def test_category_invalid_category_is_invalid(self):
        data = self.default_data.copy()
        data.update({
            'category': '121'
        })
        form = EligibilityCheckForm(client=self._client, data=data)

        self.assertFalse(form.is_valid())
        self.assertDictEqual(
            form.errors,
            {'category': [u'Select a valid choice. 121 is not one of the available choices.']}
        )

    def test_category_valid_category_is_valid(self):
        data = self.default_data.copy()
        data.update({
            'category': 'foo3'
        })
        form = EligibilityCheckForm(client=self._client, data=data)
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors, {})

    def test_save(self):
        data = self.default_data.copy()
        data['category'] = 'foo3'

        f = EligibilityCheckForm(data=data, client=self._client)
        self.assertTrue(f.is_valid())

        # saving
        eligibility_check_ref = 'el_check_ref'
        f.save(eligibility_check_ref)

        self._client.eligibility_check(eligibility_check_ref).patch.called_with(data)


class PersonalDetailsFormTestCase(test_forms.APIFormMixinTest):
    form_class = PersonalDetailsForm
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

        f = PersonalDetailsForm(data=data, client=self._client)
        self.assertTrue(f.is_valid())
        self.assertDictEqual(f.errors, {})

    def test_contact_required_validation_only_home_valid(self):
        data = self.default_data.copy()
        data['home_phone'] = '123'

        f = PersonalDetailsForm(data=data, client=self._client)
        self.assertTrue(f.is_valid())
        self.assertDictEqual(f.errors, {})

    def test_contact_required_validation_no_number_invalid(self):
        f = PersonalDetailsForm(data=self.default_data, client=self._client)
        self.assertFalse(f.is_valid())
        self.assertDictEqual(
            f.errors,
            {'mobile_phone':
                 [u'You must specify at least one contact number.']})

    def test_save(self):
        data = self.default_data.copy()
        data['home_phone'] = '123'

        f = PersonalDetailsForm(data=data, client=self._client)
        self.assertTrue(f.is_valid())

        # saving
        case_reference = 'case_ref'
        f.save(case_reference)

        self._client.case(case_reference).patch.called_with({
            'personal_details': data
        })


class CaseFormTestCase(test_forms.APIFormMixinTest):
    form_class = CaseForm
    default_data = dict()
    default_data.update({('case_notes-%s' % k):v for k,v in CaseNotesFormTestCase.default_data.items()})
    default_data.update({('eligibility_check-%s' % k):v for k,v in EligibilityCheckFormTestCase.default_data.items()})

    def setUp(self):
        super(CaseFormTestCase, self).setUp()

        self.categories = [
            {'id': 1, 'name': 'category1', 'code': 'foo1'},
            {'id': 2, 'name': 'category2', 'code': 'foo2'},
            {'id': 111, 'name': 'category2', 'code': 'foo3'},
        ]
        self._client.category.get.return_value = self.categories

    def test_save(self):
        data = self.default_data.copy()
        f = CaseForm(client=self._client, data=data)
        self.assertTrue(f.is_valid())

        case_ref = 'case_ref'
        eligibility_check_ref = 'eligibility_check_ref'
        f.save(case_ref, eligibility_check_ref)


class CaseAssignFormTestCase(test_forms.APIFormMixinTest):
    form_class = CaseAssignForm

    def setUp(self):
        super(CaseAssignFormTestCase, self).setUp()

        self.providers = [
            {'id': 1, 'name': 'provider1'},
            {'id': 2, 'name': 'provider2'},
            {'id': 111, 'name': 'provider2'},
        ]

    def test_provider_with_none_is_valid(self):
        form = CaseAssignForm(client=self._client, data={})
        self.assertTrue(form.is_valid())

    def test_save(self):
        case_reference = '1234567890'

        form = CaseAssignForm(client=self._client, data={})
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self._client.case(case_reference).assign().post.assert_called_once_with()

    def test_save_with_no_providers_for_category(self):
        case_reference = '999999'
        response = mock.MagicMock()
        response.content = \
            '{ "__all__": [ "There is no provider specified in the system to handle cases of this law category." ]}'
        response.status_code = 400
        form = CaseAssignForm(client=self._client, data={})
        self.assertTrue(form.is_valid())
        self._client.case(case_reference).assign().post.side_effect = HttpClientError(status_code=response.status_code, response=response)
        with self.assertRaises(RemoteValidationError):
            form.save(case_reference)
        self.assertFalse(form.is_valid())
        nfe = form.non_field_errors()
        self.assertEqual(len(nfe),1)


class CaseCloseFormTestCase(test_forms.APIFormMixinTest):
    form_class = CaseCloseForm

    def test_save(self):
        case_reference = '1234567890'

        data = {}
        form = CaseCloseForm(client=self._client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self._client.case(case_reference).close().post.assert_called_with(data)
