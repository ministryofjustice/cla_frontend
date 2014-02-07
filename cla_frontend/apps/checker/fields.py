from django import forms
from django.utils.translation import ugettext_lazy as _


BOOL_CHOICES = ((1, _('Yes')), (0, _('No')))


class RadioBooleanField(forms.TypedChoiceField):

    def __init__(self, *args, **kwargs):
        # kwargs['coerce'] = kwargs.pop('coerce', lambda x: bool(int(x)) if x.isdigit() else bool(x))
        kwargs['widget'] = forms.RadioSelect
        kwargs['choices'] = kwargs.pop('choices', BOOL_CHOICES)

        super(RadioBooleanField, self).__init__(*args, **kwargs)
