from django import forms


class APIFormMixin(object):
    client = None

    def __init__(self, *args, **kwargs):
        self.client = kwargs.pop('client')
        super(APIFormMixin, self).__init__(*args, **kwargs)


class OutcomeForm(APIFormMixin, forms.Form):
    outcome_code = forms.ChoiceField(required=True)
    outcome_notes = forms.CharField(
        required=False, max_length=500,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 30})
    )

    def __init__(self, *args, **kwargs):
        super(OutcomeForm, self).__init__(*args, **kwargs)

        if self.client:
            self._outcome_codes = self.get_outcome_code_queryset()
            self.fields['outcome_code'].choices = tuple(
                (x['code'], u'%s - %s' % (x['code'], x['description'])) for x in self._outcome_codes
            )

    def get_outcome_code_queryset(self):
        return self.client.outcome_code.get()
