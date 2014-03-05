import itertools
from django import forms


class MultipleFormsForm(forms.Form):
    forms_list = ()
    formset_list = ()

    def __init__(self, *args, **kwargs):
        initial = kwargs.get('initial', {})
        self.forms = []
        self.formsets = []

        for prefix, form_class in self.forms_list:
            form_kwargs = dict(kwargs)
            form_kwargs.update({
                'prefix': prefix,
                'initial': initial.get(prefix, {})
            })
            form_kwargs = self.get_form_kwargs(**form_kwargs)

            form = form_class(*args, **form_kwargs)
            self.forms.append((prefix, form))

        for prefix, formset_class in self.formset_list:
            formset_kwargs = dict(kwargs)
            formset_kwargs.update({
                'prefix': prefix,
                'initial': initial.get(prefix, {})
            })

            formset = formset_class(**formset_kwargs)

            self.formsets.append((prefix, formset))


        super(MultipleFormsForm, self).__init__(*args, **kwargs)

    def get_form_kwargs(self, **kwargs):
        return kwargs

    def is_valid(self, *args, **kwargs):
        return all(
            [form.is_valid(*args, **kwargs) for
             prefix, form in
             itertools.chain(self.forms, self.formsets)]
        )

    def get_form_by_prefix(self, prefix):
        for _prefix, form in itertools.chain(self.forms, self.formsets):
            if _prefix == prefix:
                return form
        return None

    @property
    def cleaned_data(self):
        cleaned_data = {}
        for prefix, form in self.forms:
            cleaned_data[prefix] = form.cleaned_data
        for prefix, formset in self.formsets:
            formset_cleaned_data = []
            for form in formset:
                formset_cleaned_data.append(form.cleaned_data)
            cleaned_data[prefix] = formset_cleaned_data

        return cleaned_data

    @property
    def errors(self):
        errors = {}

        for prefix, form in itertools.chain(self.forms, self.formsets):
            if form.errors:
                errors[prefix] = form.errors
        return errors

    def form_dict(self):
        form_dict = {}
        form_dict.update({k: v for k,v in self.forms})
        form_dict.update({k: v for k,v in self.formsets})
        return form_dict

