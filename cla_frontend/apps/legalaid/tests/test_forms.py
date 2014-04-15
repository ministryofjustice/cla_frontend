import mock

from django.test import testcases
from django.forms.forms import Form

from ..forms import APIFormMixin


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
