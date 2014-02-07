import pickle

from django.views.generic import TemplateView
from django.shortcuts import redirect
from django.core.urlresolvers import reverse

from django.contrib.formtools.wizard.views import NamedUrlSessionWizardView


from .forms import YourDetailsForm, YourFinancesForm, YourProblemForm


class CheckerWizard(NamedUrlSessionWizardView):
    form_list = [
        ("your_problem", YourProblemForm),
        ("your_details", YourDetailsForm),
        ("your_finances", YourFinancesForm)
    ]

    TEMPLATES = {
        "your_problem": "checker/your_problem.html",
        "your_details": "checker/your_details.html",
        "your_finances": "checker/your_finances.html",
    }

    def get_template_names(self):
        return [self.TEMPLATES[self.steps.current]]

    def get_context_data(self, form, **kwargs):
        context = super(CheckerWizard, self).get_context_data(form, **kwargs)

        history_data = {}
        for step in self.steps.all:
            if self.steps.current == step:
                continue
            history_data[step] = self.get_cleaned_data_for_step(step)
        context['history_data'] = history_data
        return context

    def get_form_initial(self, step):
        history_data = self.request.session.get('checker_result')
        if history_data:
            history_data = pickle.loads(history_data)
            return history_data.get(step, {})
        return {}

    def done(self, *args, **kwargs):
        data = {}
        for step in self.steps.all:
            data[step] = self.get_cleaned_data_for_step(step)

        self.request.session['checker_result'] = pickle.dumps(data)
        return redirect(reverse('checker:result'))


class ResultView(TemplateView):
    template_name = 'checker/result.html'

    def get(self, request, *args, **kwargs):
        return super(ResultView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ResultView, self).get_context_data(**kwargs)

        context['history_data'] = pickle.loads(self.request.session['checker_result'])
        return context
