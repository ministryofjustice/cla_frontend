# -*- coding: utf-8 -*-
import decimal

from flask_wtf import Form
from wtforms import TextField, PasswordField, BooleanField, IntegerField, \
    RadioField, DecimalField
from wtforms.validators import DataRequired

#
# class LoginForm(Form):
#     username = TextField('Username', validators=[DataRequired()])
#     password = PasswordField('Password', validators=[DataRequired()])
#
#     def __init__(self, *args, **kwargs):
#         super(LoginForm, self).__init__(*args, **kwargs)
#         self.user = None
#
#     def validate(self):
#         initial_validation = super(LoginForm, self).validate()
#         if not initial_validation:
#             return False
#
#         self.user = User.query.filter_by(username=self.username.data).first()
#         if not self.user:
#             self.username.errors.append("Unknown username")
#             return False
#
#         if not self.user.check_password(self.password.data):
#             self.password.errors.append("Invalid password")
#             return False
#
#         if not self.user.active:
#             self.username.errors.append("User not activated")
#             return False
#         return True


class YourDetailsForm(Form):
    partner = BooleanField(label="Do you have a partner?")


class YourFinancesForm(Form):
    property_worth = IntegerField(label=u"How much is it worth?")
    property_morgage_left = IntegerField(label=u"How much is left to pay on the mortgage?")
    property_owner = RadioField(
        label=u"Is the property owned by you or is it in joint names?",
        choices=[('Owned by me', 'me'), ('Joint names', 'joint-names')]
    )
    property_share = DecimalField(
        u'What is your share of the property?',
        places=2, rounding=decimal.ROUND_UP
    )

    # TODO shouldn't be here?
    other_properties = BooleanField(label=u'Do you own another property?')


    savings_bank = IntegerField(label=u"Do you have any money saved in a bank or building society?")
    savings_investments = IntegerField(label=u"Do you have any investments, shares, ISAs?")
    savings_valuable_items = IntegerField(label=u"Do you have any valuable items over £££ each?")
    savings_money_owed = IntegerField(label=u"Do you have any money owed to you?")
