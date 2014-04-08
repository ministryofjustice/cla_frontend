from cla_common import constants
from django.forms.forms import Form
import mock

from django.test import testcases
from ..forms import CaseAssignForm, CaseCloseForm, CaseForm, APIFormMixin, \
EligibilityCheckForm, PersonalDetailsForm

BLANK_CHOICE = [('', '----')]


class APIFormMixinTest(testcases.SimpleTestCase):

    class TestForm(APIFormMixin, Form):
        pass

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


class CaseAssignFormTest(testcases.SimpleTestCase):

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

