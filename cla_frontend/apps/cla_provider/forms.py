from django import forms

from cla_common.constants import CASE_STATE_REJECTED, CASE_STATE_ACCEPTED, \
    CASE_STATE_CLOSED

from legalaid.forms import OutcomeForm


class RejectCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(case_state=CASE_STATE_REJECTED)

    def save(self, case_reference):
        response = self.client.case(case_reference).reject().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?


class AcceptCaseForm(OutcomeForm):
    def __init__(self, *args, **kwargs):
        super(AcceptCaseForm, self).__init__(*args, **kwargs)

        self.fields['outcome_code'].initial = self.fields['outcome_code'].choices[0][0]
        self.fields['outcome_code'].widget = forms.HiddenInput()
        self.fields['outcome_notes'].widget = forms.HiddenInput()


    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(case_state=CASE_STATE_ACCEPTED)

    def save(self, case_reference):
        response = self.client.case(case_reference).accept().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?


class CloseCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(case_state=CASE_STATE_CLOSED)

    def save(self, case_reference):
        response = self.client.case(case_reference).close().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
