from django import forms
from django.forms import fields

from legalaid.forms import APIFormMixin, BaseCaseLogForm, EventSpecificLogForm


class CaseForm(APIFormMixin, forms.Form):
    provider_notes = fields.CharField(
        required=False, max_length=500,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 30})
    )

    def save(self, case_reference):
        if self.is_valid():
            self.client.case(case_reference).patch(self.cleaned_data)


class RejectCaseForm(EventSpecificLogForm):
    EVENT_KEY = 'reject_case'

    def save(self, case_reference):
        response = self.client.case(case_reference).reject().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?


class AcceptCaseForm(BaseCaseLogForm):
    def save(self, case_reference):
        response = self.client.case(case_reference).accept().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?


class CloseCaseForm(BaseCaseLogForm):
    def save(self, case_reference):
        response = self.client.case(case_reference).close().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
