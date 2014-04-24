from legalaid.tests import test_forms

from cla_common.constants import CASE_STATE_REJECTED, CASE_STATE_ACCEPTED

from ..forms import RejectCaseForm, AcceptCaseForm


class RejectCaseFormTest(test_forms.OutcomeFormTest):
    formclass = RejectCaseForm

    def test_choices(self):
        super(RejectCaseFormTest, self).test_choices()
        self.client.outcome_code.get.assert_called_with(case_state=CASE_STATE_REJECTED)

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
        self.client.outcome_code.get.assert_called_with(case_state=CASE_STATE_ACCEPTED)

    def test_save(self):
        case_reference = '1234567890'

        data = self._get_default_post_data()
        form = AcceptCaseForm(client=self.client, data=data)
        self.assertTrue(form.is_valid())

        form.save(case_reference)
        self.client.case(case_reference).accept().post.assert_called_with(data)
