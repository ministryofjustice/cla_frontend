from cla_common.constants import CASE_STATE_REJECTED, CASE_STATE_ACCEPTED

from legalaid.forms import OutcomeForm


class RejectCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(case_state=CASE_STATE_REJECTED)

    def save(self, case_reference):
        response = self.client.case(case_reference).reject().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
