# -*- coding: utf-8 -*-
from django import forms
from django.forms.forms import Form
from django.forms import fields
from .fields import RadioBooleanField


class YourFinancesForm(forms.Form):
    # PROPERTY
    property_worth = forms.IntegerField(label=u"How much is it worth?", min_value=0)
    property_morgage_left = forms.IntegerField(
        label=u"How much is left to pay on the mortgage?", min_value=0
    )
    property_owner = forms.ChoiceField(
        label=u"Is the property owned by you or is it in joint names?",
        choices=[
            ('Owned by me', 'me'),
            ('Joint names', 'joint-names')
        ],
        widget=forms.RadioSelect()
    )
    property_share = forms.DecimalField(
        label=u'What is your share of the property?', decimal_places=2,
        min_value=0, max_value=100
    )

    # TODO shouldn't be here?
    other_properties = forms.BooleanField(
        label=u'Do you own another property?',
        widget=forms.RadioSelect(choices=((True, 'Yes'), (False, 'No')))
    )

    # SAVINGS
    savings_bank = forms.IntegerField(
        label=u"Do you have any money saved in a bank or building society?",
        min_value=0
    )
    savings_investments = forms.IntegerField(
        label=u"Do you have any investments, shares, ISAs?", min_value=0
    )
    savings_valuable_items = forms.IntegerField(
        label=u"Do you have any valuable items over £££ each?", min_value=0
    )
    savings_money_owed = forms.IntegerField(
        label=u"Do you have any money owed to you?", min_value=0
    )


class YourDetailsForm(Form):
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
