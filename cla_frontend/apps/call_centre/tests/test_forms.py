import mock

from django.test import testcases
from ..forms import CaseAssignForm, CaseCloseForm, CaseForm, APIFormMixin, \
EligibilityCheckForm, PersonalDetailsForm

class CaseCloseFormTest(testcases.SimpleTestCase):

    def test_called_with_none_is_invalid(self):
        form = CaseCloseForm(data={'reason': ''})
        self.assertFalse(form.is_valid())
        print form._errors
