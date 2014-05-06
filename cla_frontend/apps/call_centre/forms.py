import json
from django import forms
from django.core.exceptions import NON_FIELD_ERRORS
from django.forms.util import ErrorList
from django.utils.translation import ugettext_lazy as _
import itertools
from slumber.exceptions import HttpClientError

from cla_common.forms import MultipleFormsForm
from cla_common.constants import STATE_MAYBE, STATE_CHOICES, TITLE_CHOICES
from core.exceptions import RemoteValidationError

from legalaid.forms import APIFormMixin

EMPTY_CHOICE = (('', '----'),)
AUTO_ASSIGN_CHOICE = (('0', 'Auto assign'),)

class CaseNotesForm(forms.Form):
    notes = forms.CharField(widget=forms.Textarea, label=_('Case Notes'),
                            max_length=500, required=False)
    in_scope = forms.NullBooleanField(label=_('In Scope'), required=False)


class EligibilityCheckForm(APIFormMixin, forms.Form):
    extra_kwargs = {'client'}
    client = None

    category = forms.ChoiceField(
        label=_(u'Law Category:')
    )

    state = forms.ChoiceField(label=_('Means Test Passed?'), choices=STATE_CHOICES, initial=STATE_MAYBE)

    def __init__(self, *args, **kwargs):
        super(EligibilityCheckForm, self).__init__(*args, **kwargs)
        if self.client:
            self._categories = self.client.category.get()
            choices = [(x['code'], x['name']) for x in self._categories]
            self.fields['category'].choices = choices


class PersonalDetailsForm(forms.Form):
    # title = forms.ChoiceField(
    #     label=_(u'Title'), choices=TITLE_CHOICES
    # )
    full_name = forms.CharField(label=_(u'Full name'), max_length=300)
    postcode = forms.CharField(label=_(u'Postcode'), max_length=10)
    street = forms.CharField(
        label=_(u'Street'), max_length=250,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 21})
    )
    # town = forms.CharField(label=_(u'Town'), max_length=100)
    mobile_phone = forms.CharField(label=_(u'Mobile Phone'), max_length=20, required=False)
    home_phone = forms.CharField(label=_('Home Phone'), max_length=20, required=False)

    def clean(self, *args, **kwargs):
        cleaned_data = super(PersonalDetailsForm, self).clean(*args, **kwargs)

        if self._errors: # skip immediately
            return cleaned_data

        mobile_phone = cleaned_data.get('mobile_phone')
        home_phone = cleaned_data.get('home_phone')
        if not mobile_phone and not home_phone:
            self._errors['mobile_phone'] = ErrorList([
                _(u'You must specify at least one contact number.')
            ])
            del cleaned_data['mobile_phone']

        return cleaned_data


class CaseForm(MultipleFormsForm):
    forms_list = (
        ('case_notes', CaseNotesForm),
        ('eligibility_check', EligibilityCheckForm),
    )


class CaseAssignForm(APIFormMixin, forms.Form):

    def save(self, case_reference):
        """
        @return: dict provider
        """
        # TODO do something in case of 4xx and 5xx errors ?
        # This posts no data ; just POSTing assigns a random provider
        try:
            return self.client.case(case_reference).assign().post()
        except HttpClientError as hce:
            if hce.response.status_code == 400:
                remote_errors = json.loads(hce.response.content)
                non_field_errors = []
                for error_field_name, value in remote_errors.items():
                    if error_field_name in self.fields:
                        self._errors[error_field_name] = ErrorList(value)
                    else:
                        non_field_errors.append(value)
                self._errors[NON_FIELD_ERRORS] = ErrorList(itertools.chain.from_iterable(non_field_errors))
                raise RemoteValidationError('Remote form validation error. see form.errors')
            else:
                raise

class CaseCloseForm(APIFormMixin, forms.Form):
    def save(self, case_reference):
        response = self.client.case(case_reference).close().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
