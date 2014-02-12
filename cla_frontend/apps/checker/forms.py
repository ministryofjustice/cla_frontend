# -*- coding: utf-8 -*-
from django import forms
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext as _

from core.forms import MultipleFormsForm
from api.client import connection

from .fields import RadioBooleanField


class CheckerWizardMixin(object):
    def __init__(self, *args, **kwargs):
        self.reference = kwargs.pop('reference', None)
        super(CheckerWizardMixin, self).__init__(*args, **kwargs)


class YourProblemForm(CheckerWizardMixin, forms.Form):
    """
    Gets the problem choices from the backend API.
    """
    your_problem = forms.ChoiceField(
        label=_(u'Is your problem about?'),
        choices=(), widget=forms.RadioSelect()
    )
    notes = forms.CharField(
        required=False, max_length=500,
        label=_(u'You can also provide additional details about your case in the text box below.'),
        widget=forms.Textarea(attrs={'rows': 5, 'cols': 80})
    )

    def __init__(self, *args, **kwargs):
        super(YourProblemForm, self).__init__(*args, **kwargs)

        categories = connection.category.get()

        def get_category_choice(category):
            id = category['id']
            label = category['name']
            if category['description']:
                label = mark_safe(u'%s <br> <p class="bs-callout bs-callout-warning">%s</p>' % (label, category['description']))
            return (id, label)
        self.fields['your_problem'].choices = [get_category_choice(cat) for cat in categories]

    def save(self):
        data = {
            'category': self.cleaned_data.get('your_problem'),
            'notes': self.cleaned_data.get('notes', '')
        }

        if not self.reference:
            return connection.eligibility_check.create()

        return connection.eligibility_check(self.reference).patch(data)


class YourDetailsForm(CheckerWizardMixin, forms.Form):
    has_partner = RadioBooleanField(required=True,
                                     label='Do you have a partner?'
    )

    has_benefits = RadioBooleanField(required=True,
                                     label='Are you or your partner on any benefits?'
    )


    has_children = RadioBooleanField(required=True,
                                     label='Do you have children?'
    )


    caring_responsibilities = RadioBooleanField(required=True,
                                         label='Do you any other caring responsibilities??'
    )

    own_property = RadioBooleanField(required=True,
                                         label='Do you or your partner own a property?'
    )

    risk_homeless = RadioBooleanField(required=True,
                                         label='Are you or your partner aged 60 or over?'
    )

    older_than_sixty = RadioBooleanField(required=True,
                                         label='Do you have a partner?'
    )


class YourFinancesPropertyForm(forms.Form):
    worth = forms.IntegerField(label=u"How much is it worth?", min_value=0)
    morgage_left = forms.IntegerField(
        label=u"How much is left to pay on the mortgage?", min_value=0
    )
    owner = forms.ChoiceField(
        label=u"Is the property owned by you or is it in joint names?",
        choices=[
            ('Owned by me', 'me'),
            ('Joint names', 'joint-names')
        ],
        widget=forms.RadioSelect()
    )
    share = forms.DecimalField(
        label=u'What is your share of the property?', decimal_places=2,
        min_value=0, max_value=100
    )

    # TODO shouldn't be here?
    other_properties = RadioBooleanField(required=True,
                                     label='Do you own another property?'
    )


class YourFinancesSavingsForm(forms.Form):
    bank = forms.IntegerField(
        label=u"Do you have any money saved in a bank or building society?",
        min_value=0
    )
    investments = forms.IntegerField(
        label=u"Do you have any investments, shares, ISAs?", min_value=0
    )
    valuable_items = forms.IntegerField(
        label=u"Do you have any valuable items over £££ each?", min_value=0
    )
    money_owed = forms.IntegerField(
        label=u"Do you have any money owed to you?", min_value=0
    )


class YourFinancesForm(CheckerWizardMixin, MultipleFormsForm):
    forms_list = (
        ('property', YourFinancesPropertyForm),
        ('your_savings', YourFinancesSavingsForm),
        ('partners_savings', YourFinancesSavingsForm),
    )


class ContactDetails(forms.Form):
    title = forms.ChoiceField(
        label=u'Title', choices=(
            ('mr', 'Mr'),
            ('mrs', 'Mrs'),
            ('miss', 'Miss'),
            ('ms', 'Ms'),
            ('dr', 'Dr')
        )
    )
    fullname = forms.CharField(label=u'Full name', max_length=200)
    postcode = forms.CharField(label=u'Postcode', max_length=10)
    street = forms.CharField(
        label='Street', max_length=300,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 21})
    )
    town = forms.CharField(label=u'Town', max_length=20)
    tel_type = forms.ChoiceField(label=None, choices=(
            ('mob', 'mobile'),
            ('work', 'work'),
            ('home', 'home')
        )
    )
    tel = forms.CharField(label=None, max_length=100)
