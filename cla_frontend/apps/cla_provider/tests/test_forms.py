import mock
from legalaid.tests import test_forms

from cla_common.constants import CASE_STATES, CASELOGTYPE_ACTION_KEYS

from ..forms import RejectCaseForm, AcceptCaseForm, CaseForm, CloseCaseForm
from legalaid.tests.test_forms import APIFormMixinTest


class RejectCaseFormTest(test_forms.OutcomeFormTest):
    formclass = RejectCaseForm

    def test_choices(self):
        super(RejectCaseFormTest, self).test_choices()
        self.client.outcome_code.get.assert_called_with(
            action_key=CASELOGTYPE_ACTION_KEYS.PROVIDER_REJECT_CASE
        )

    def test_save(self):
        case_reference = '1234567890'

        data = self._get_default_post_data()
        form = RejectCaseForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).reject().post.assert_called_with(data)


class AcceptCaseFormTest(test_forms.OutcomeFormTest):
    formclass = AcceptCaseForm

    def test_choices(self):
        super(AcceptCaseFormTest, self).test_choices()
        self.client.outcome_code.get.assert_called_with(
            action_key=CASELOGTYPE_ACTION_KEYS.PROVIDER_ACCEPT_CASE
        )

    def test_save(self):
        case_reference = '1234567890'

        data = self._get_default_post_data()
        form = AcceptCaseForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).accept().post.assert_called_with(data)


class CaseFormTest(APIFormMixinTest):
    formclass = CaseForm

    def test_save(self):
        case_reference = '123456'
        data = {
            'provider_notes': 'hello'
        }
        form = CaseForm(client=self._client, data=data)

        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self._client.case(case_reference).patch.assert_called_with(data)


class CloseCaseFormTest(test_forms.OutcomeFormTest):
    formclass = CloseCaseForm

    def test_choices(self):
        super(CloseCaseFormTest, self).test_choices()
        self.client.outcome_code.get.assert_called_with(
            action_key=CASELOGTYPE_ACTION_KEYS.PROVIDER_CLOSE_CASE
        )

    def test_save(self):
        case_reference = '1234567890'

        data = self._get_default_post_data()
        form = CloseCaseForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).close().post.assert_called_with(data)
