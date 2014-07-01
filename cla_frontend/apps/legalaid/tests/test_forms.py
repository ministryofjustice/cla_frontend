import mock

from django.test import testcases
from django.forms.forms import Form

from legalaid.forms import BaseCaseLogForm, EventSpecificLogForm

from ..forms import APIFormMixin


class APIFormMixinTest(testcases.SimpleTestCase):

    formclass = None
    class TestForm(APIFormMixin, Form):
        pass

    def setUp(self):
        self._client = mock.MagicMock()
        super(APIFormMixinTest, self).setUp()

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
            self.TestForm(notclient=mock.MagicMock())

    def test_form_rejects_bad_kwarg(self):
        with self.assertRaises(TypeError):
            self.TestForm(client=mock.MagicMock(), foo='bar')


class ImplicitEventFormTestCaseMixin(testcases.SimpleTestCase):
    formclass = None

    class TestForm(BaseCaseLogForm):
        pass

    def setUp(self):
        self.client = mock.MagicMock()

    def _get_test_form(self):
        if self.formclass:
            return self.formclass
        return self.TestForm

    def _get_default_post_data(self, data={}):
        default_data = {
            'notes': 'lorem ipsum'
        }
        default_data.update(data)
        return default_data

    def test_is_valid_True(self):
        data = self._get_default_post_data()
        form = self._get_test_form()(client=self.client, data=data)
        self.assertTrue(form.is_valid())
        self.assertDictEqual(form.errors, {})


class ExplicitEventFormTestCaseMixin(ImplicitEventFormTestCaseMixin):
    class TestForm(EventSpecificLogForm):
        EVENT_KEY = 'my_event_key'

    def setUp(self):
        super(ExplicitEventFormTestCaseMixin, self).setUp()

        self.codes = [
            {
                'code': 'code1',
                'description': 'description1'
            },
            {
                'code': 'code2',
                'description': 'description2'
            }
        ]

        form = self._get_test_form()
        getattr(self.client.event, form.EVENT_KEY).get.return_value = self.codes

    def _get_default_post_data(self, data={}):
        default_data = {
            'notes': 'lorem ipsum',
            'code': self.codes[0]['code']
        }
        default_data.update(data)
        return default_data

    def test_choices(self):
        codes_expected = tuple(
            (x['code'], x['code']) for x in self.codes
        )

        form = self._get_test_form()(client=self.client)
        self.assertItemsEqual(form.fields['code'].choices, codes_expected)

        self.assertEqual(getattr(self.client.event, form.EVENT_KEY).get.called, True)

    def test_invalid_if_code_is_invalid(self):
        data = self._get_default_post_data({
            'code': 'invalid'
        })
        form = self._get_test_form()(client=self.client, data=data)
        self.assertFalse(form.is_valid())
        self.assertDictEqual(
            form.errors,
            {'code': [u'Select a valid choice. invalid is not one of the available choices.']
        })
