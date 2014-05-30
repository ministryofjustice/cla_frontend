import json
import itertools
from slumber.exceptions import HttpClientError

from django import forms
from django.core.exceptions import NON_FIELD_ERRORS
from django.forms.util import ErrorList
from django.utils.translation import ugettext_lazy as _

from cla_common.forms import MultipleFormsForm
from cla_common.constants import ELIGIBILITY_STATES, TITLES, \
    CASELOGTYPE_ACTION_KEYS
from core.exceptions import RemoteValidationError

from legalaid.forms import APIFormMixin, OutcomeForm

EMPTY_CHOICE = (('', '----'),)
AUTO_ASSIGN_CHOICE = (('0', 'Auto assign'),)


class SearchCaseForm(APIFormMixin, forms.Form):
    def search(self, q=None):

        search_params = {}
        if q:
            search_params['search'] = q

        return self.client.case.get(**search_params)


class CaseNotesForm(APIFormMixin, forms.Form):
    notes = forms.CharField(widget=forms.Textarea, label=_('Case Notes'),
                            max_length=500, required=False)
    in_scope = forms.NullBooleanField(label=_('In Scope'), required=False)

    def save(self, case_reference):
        data = self.cleaned_data
        self.client.case(case_reference).patch(data)


class EligibilityCheckForm(APIFormMixin, forms.Form):
    extra_kwargs = {'client'}
    client = None

    category = forms.ChoiceField(
        label=_(u'Law Category:')
    )

    state = forms.ChoiceField(
        label=_('Means Test Passed?'), choices=ELIGIBILITY_STATES.CHOICES,
        initial=ELIGIBILITY_STATES.MAYBE
    )

    def __init__(self, *args, **kwargs):
        super(EligibilityCheckForm, self).__init__(*args, **kwargs)
        if self.client:
            self._categories = self.client.category.get()
            choices = [(x['code'], x['name']) for x in self._categories]
            self.fields['category'].choices = choices

    def save(self, eligibility_check_reference):
        data = self.cleaned_data
        self.client.eligibility_check(eligibility_check_reference).patch(data)


class PersonalDetailsForm(APIFormMixin, forms.Form):
    # title = forms.ChoiceField(
    #     label=_(u'Title'), choices=TITLES.CHOICES
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

    def save(self, case_reference):
        data = self.cleaned_data
        self.client.case(case_reference).patch({'personal_details': data})


class CaseForm(APIFormMixin, MultipleFormsForm):
    forms_list = (
        ('case_notes', CaseNotesForm),
        ('eligibility_check', EligibilityCheckForm),
    )

    def get_form_kwargs(self, form_class, **kwargs):
        kwargs = super(CaseForm, self).get_form_kwargs(form_class, **kwargs)
        kwargs['client'] = self.client
        return kwargs

    def save(self, case_reference, eligibility_check_reference):
        self.get_form_by_prefix('case_notes').save(case_reference)
        self.get_form_by_prefix('eligibility_check').save(eligibility_check_reference)


class CaseAssignForm(APIFormMixin, forms.Form):

    #providers = forms.ChoiceField(widget=forms.RadioSelect)
    
    providers = AdvancedCollectionChoiceField(
        collection=[],
        pk_attr=u'id',
        label_attr=u'name',
        #label=_(u'Is your problem about? XXX'),
        widget=forms.RadioSelect()
    )
    
    suggested_provider = forms.IntegerField(widget=forms.HiddenInput)

    def save(self, case_reference, provider_id, is_manual, assign_notes):
        """
        @return: dict provider
        """
        # TODO do something in case of 4xx and 5xx errors ?
        post_me = {'provider_id' : provider_id,
                   'is_manual' : is_manual,
                   'assign_notes' : assign_notes
                  }
        try:
            return self.client.case(case_reference).assign().post(post_me)
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

class DeferAssignCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(
            action_key=CASELOGTYPE_ACTION_KEYS.DEFER_ASSIGNMENT
        )

    def save(self, case_reference):
        response = self.client.case(case_reference).defer_assignment().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?

class DeclineSpecialistsCaseForm(OutcomeForm):

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get(
            action_key=CASELOGTYPE_ACTION_KEYS.DECLINE_SPECIALISTS
        )

    def save(self, case_reference):
        response = self.client.case(case_reference).decline_all_specialists().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
