from django.shortcuts import redirect
from django.core.urlresolvers import reverse

from django.contrib.formtools.wizard.views import NamedUrlSessionWizardView

from .forms import YourDetailsForm, YourFinancesForm, YourProblemForm, \
    ResultForm


class CheckerWizard(NamedUrlSessionWizardView):
    storage_name = 'checker.storage.CheckerSessionStorage'

    form_list = [
        ("your_problem", YourProblemForm),
        ("your_details", YourDetailsForm),
        ("your_finances", YourFinancesForm),
        ("result", ResultForm)
    ]

    TEMPLATES = {
        "your_problem": "checker/your_problem.html",
        "your_details": "checker/your_details.html",
        "your_finances": "checker/your_finances.html",
        "result": "checker/result.html"
    }

    def dispatch(self, request, *args, **kwargs):
        # self.session_helper = SessionCheckerHelper(request)
        return super(CheckerWizard, self).dispatch(request, *args, **kwargs)

    def get_template_names(self):
        return [self.TEMPLATES[self.steps.current]]

    def get_context_data(self, form, **kwargs):
        context = super(CheckerWizard, self).get_context_data(form, **kwargs)

        history_data = {}
        for step in self.steps.all:
            if step == self.storage.current_step:
                continue

            cleaned_data = self.get_cleaned_data_for_step(step)

            if cleaned_data:
                history_data[step] = cleaned_data

        context['history_data'] = history_data
        context.update(form.get_context_data())
        return context

    def get_form_kwargs(self, step=None):
        kwargs = super(CheckerWizard, self).get_form_kwargs(step=step)
        kwargs['reference'] = self.storage.get_reference()
        if step == 'your_finances':
            details_data = self.get_cleaned_data_for_step('your_details')
            if details_data:
                kwargs['has_partner'] = bool(details_data['has_partner'])
                kwargs['has_children'] = bool(details_data['has_children'])
                kwargs['has_property'] = bool(details_data['own_property'])
        return kwargs

    def process_step(self, form):
        response_data = form.save()
        self.storage.set_if_necessary_reference(response_data['reference'])
        return super(CheckerWizard, self).process_step(form)

    def done(self, *args, **kwargs):
        data = {}
        for step in self.steps.all:
            data[step] = self.get_cleaned_data_for_step(step)

        return redirect(reverse('checker:done'))
