from django.views.generic import TemplateView, FormView

from .forms import YourFinancesForm


class YourProblemView(TemplateView):
    template_name = 'checker/your_problem.html'


class YourDetailsView(TemplateView):
    template_name = 'checker/your_details.html'


class YourFinancesView(FormView):
    template_name = 'checker/your_finances.html'
    form_class = YourFinancesForm

    def get_success_url(self):
        # TODO go somewhere
        return reverse('checker:home')

    def form_valid(self, form):
        # TODO do something

        return super(YourFinancesView, self).form_valid(form)

