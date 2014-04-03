from django import forms


def api_to_case(data):
    new_data = {}
    personal_details = data.get('personal_details', {})
    eligibility_check = data.get('eligibility_check', {})
    if eligibility_check:
        new_data.update(eligibility_check)
    if personal_details:
        new_data.update(personal_details)
    return new_data


def case_to_api(data):
    personal_details_keys = {}
    eligibility_check_keys = {'notes', 'category', 'reference'}
    new_data = {}
    personal_details = {k: v for k,v in data.items() if k in personal_details_keys}
    eligibility_check = {k: v for k,v in data.items() if k in eligibility_check_keys}
    if personal_details_keys:
        new_data['personal_details'] = personal_details
    if eligibility_check:
        new_data['eligibility_check'] = eligibility_check
    return new_data

class CaseForm(forms.Form):
    notes = forms.CharField(widget=forms.Textarea)

    def __init__(self, *args, **kwargs):
        data = kwargs.get('initial', None)
        if data:
            data = api_to_case(data)
            kwargs['initial'] = data
        super(CaseForm, self).__init__(*args, **kwargs)

    def save(self):
        data = self.cleaned_data
        return case_to_api(data)