from django import forms


class CaseForm(forms.Form):
    reference = forms.CharField(max_length=35, )
