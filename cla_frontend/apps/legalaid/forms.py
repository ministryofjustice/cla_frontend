from django import forms


class APIFormMixin(object):
    client = None

    def __init__(self, *args, **kwargs):
        self.client = kwargs.pop('client')
        super(APIFormMixin, self).__init__(*args, **kwargs)


class BaseCaseLogForm(APIFormMixin, forms.Form):
    notes = forms.CharField(
        required=False, max_length=500,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 30})
    )


class EventSpecificLogForm(BaseCaseLogForm):
    EVENT_KEY = None

    code = forms.ChoiceField(required=True)

    def __init__(self, *args, **kwargs):
        super(EventSpecificLogForm, self).__init__(*args, **kwargs)

        if self.client:
            self._codes = self.get_codes()
            self.fields['code'].choices = tuple(
                (x['code'], x['code']) for x in self._codes
            )

    def get_codes(self):
        endpoint = self.client.event
        endpoint = getattr(endpoint, self.EVENT_KEY)

        return endpoint.get()
