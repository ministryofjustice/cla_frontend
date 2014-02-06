# -*- coding: utf-8 -*-
from django import forms

from core.forms import MultipleFormsForm



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
    other_properties = forms.BooleanField(
        label=u'Do you own another property?',
        widget=forms.RadioSelect(choices=((True, 'Yes'), (False, 'No')))
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


class YourFinancesForm(MultipleFormsForm):
    forms_list = (
        ('property', YourFinancesPropertyForm),
        ('your_savings', YourFinancesSavingsForm),
        ('partners_savings', YourFinancesSavingsForm),
    )
