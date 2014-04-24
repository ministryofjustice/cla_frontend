from django import forms
from django.forms.util import ErrorList
from django.utils.translation import ugettext_lazy as _

from cla_common.forms import MultipleFormsForm
from cla_common.constants import STATE_MAYBE, STATE_CHOICES, TITLE_CHOICES

from legalaid.forms import APIFormMixin

EMPTY_CHOICE = (('', '----'),)


class EligibilityCheckForm(APIFormMixin, forms.Form):
    extra_kwargs = {'client'}
    client = None

    category = forms.ChoiceField(
        label=_(u'Law Category:')
    )
    notes = forms.CharField(widget=forms.Textarea, label=_('Case Notes'))

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
        ('eligibility_check', EligibilityCheckForm),
    )


class CaseAssignForm(APIFormMixin, forms.Form):
    provider = forms.TypedChoiceField(required=True, coerce=int)

    def __init__(self, *args, **kwargs):
        super(CaseAssignForm, self).__init__(*args, **kwargs)
        if self.client:
            self._providers = self.client.provider.get()
            self.fields['provider'].choices = EMPTY_CHOICE + \
                                            tuple((x['id'], x['name']) for x in self._providers)

    def save(self, case_reference):
        # TODO do something in case of 4xx and 5xx errors ?
        return self.client.case(case_reference).assign().post(self.cleaned_data)


class CaseCloseForm(APIFormMixin, forms.Form):
    def save(self, case_reference):
        response = self.client.case(case_reference).close().post(self.cleaned_data)
        # TODO do something in case of 4xx and 5xx errors ?
