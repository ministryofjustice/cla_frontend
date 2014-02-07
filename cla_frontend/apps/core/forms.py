from django import forms


class MultipleFormsForm(forms.Form):
    forms_list = ()

    def __init__(self, *args, **kwargs):
        initial = kwargs.get('initial')
        self.forms = []

        for prefix, form_class in self.forms_list:
            form_kwargs = dict(kwargs)
            form_kwargs.update({
                'prefix': prefix,
                'initial': initial.get(prefix, {})
            })
            form_kwargs = self.get_form_kwargs(**form_kwargs)

            form = form_class(*args, **form_kwargs)
            self.forms.append((prefix, form))

        super(MultipleFormsForm, self).__init__(*args, **kwargs)

    def get_form_kwargs(self, **kwargs):
        return kwargs

    def is_valid(self, *args, **kwargs):
        return all(
            [form.is_valid(*args, **kwargs) for prefix, form in self.forms]
        )

    def get_form_by_prefix(self, prefix):
        for _prefix, form in self.forms:
            if _prefix == prefix:
                return form
        return None

    @property
    def cleaned_data(self):
        cleaned_data = {}
        for prefix, form in self.forms:
            cleaned_data[prefix] = form.cleaned_data
        return cleaned_data

    @property
    def errors(self):
        errors = {}

        for prefix, form in self.forms:
            if form.errors:
                errors[prefix] = form.errors
        return errors

    def __getattr__(self, name):
        form =  self.get_form_by_prefix(name)
        if form:
            return form
        return super(MultipleFormsForm, self).__getattr__(name)
