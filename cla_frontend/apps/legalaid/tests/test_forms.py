import mock

from django.test import testcases
from django.forms.forms import Form

from ..forms import APIFormMixin, OutcomeForm


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


class OutcomeFormTest(testcases.SimpleTestCase):
    formclass = None
    class TestForm(OutcomeForm):
        pass

    def _get_test_form(self):
        if self.formclass:
            return self.formclass
        return self.TestForm

    def setUp(self):
        self.client = mock.MagicMock()
        self.outcome_codes = [
            {'code': 'AAA', 'description': 'aaa'},
            {'code': 'BBB', 'description': 'bbb'},
        ]
        self.client.outcome_code.get.return_value = self.outcome_codes

    def test_choices(self):
        outcome_codes_expected = tuple(
            (x['code'], u'%s - %s' % (x['code'], x['description'])) for x in self.outcome_codes
        )

        form = self._get_test_form()(client=self.client)
        self.assertItemsEqual(form.fields['outcome_code'].choices, outcome_codes_expected)

    def _get_default_post_data(self, data={}):
        default_data = {
            'outcome_code': self.outcome_codes[0]['code'],
            'outcome_notes': 'lorem ipsum'
        }
        default_data.update(data)
        return default_data

    def test_invalid_if_outcome_code_is_invalid(self):
        data = self._get_default_post_data({
            'outcome_code': 'invalid'
        })
        form = self._get_test_form()(client=self.client, data=data)
        self.assertFalse(form.is_valid())
        self.assertDictEqual(
            form.errors,
            {'outcome_code': [u'Select a valid choice. invalid is not one of the available choices.']
        })

    def test_is_valid_True(self):
        data = self._get_default_post_data()
        form = self._get_test_form()(client=self.client, data=data)
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors, {})
