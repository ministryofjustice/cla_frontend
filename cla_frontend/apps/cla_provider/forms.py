from django import forms
from django.forms import fields

from cla_common.constants import CASELOGTYPE_ACTION_KEYS

from legalaid.forms import OutcomeForm, APIFormMixin


class CaseForm(APIFormMixin, forms.Form):

    provider_notes = fields.CharField(
        required=False, max_length=500,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 30})
    )

    def save(self, case_reference):
        if self.is_valid():
            self.client.case(case_reference).patch(self.cleaned_data)

class RejectCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(
            action_key=CASELOGTYPE_ACTION_KEYS.PROVIDER_REJECT_CASE
        )

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
        return self.client.outcome_code.get(
            action_key=CASELOGTYPE_ACTION_KEYS.PROVIDER_ACCEPT_CASE
        )

    def save(self, case_reference):
        response = self.client.case(case_reference).accept().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?


class CloseCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(
            action_key=CASELOGTYPE_ACTION_KEYS.PROVIDER_CLOSE_CASE
        )

    def save(self, case_reference):
        response = self.client.case(case_reference).close().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
