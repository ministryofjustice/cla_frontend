from django.views.generic import TemplateView

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
        context['history_data'] = self.get_all_cleaned_data()
        return context

    # def get_step_url(self, step):
    #     if step == 'your_details':
    #         return reverse(u'checker:%s' % step, kwargs=self.kwargs)
    #     return reverse(u'checker:%s' % step)


class ResultView(TemplateView):
    template_name = 'checker/result.html'
