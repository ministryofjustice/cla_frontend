from django.views.generic import TemplateView, FormView
from django.core.urlresolvers import reverse
from django.shortcuts import redirect

from .forms import YourDetailsForm, YourFinancesForm


class YourProblemView(TemplateView):
    template_name = 'checker/your_problem.html'

    def post(self, request, *args, **kwargs):
        response = request.POST.get('response')
        destination = reverse('checker:your_problem', kwargs={'category':response})
        return redirect(destination)


class YourDetailsView(FormView):
    form_class = YourDetailsForm
    template_name = 'checker/your_details.html'

    def get_success_url(self):
        return reverse('checker:your_finances')

    def get_context_data(self, **kwargs):
        context = super(YourDetailsView, self).get_context_data(**kwargs)
        context.update(self.kwargs)
        return context


class YourFinancesView(FormView):
    template_name = 'checker/your_finances.html'
    form_class = YourFinancesForm

    def get_success_url(self):
        # TODO go somewhere
        return reverse('checker:result')

    def form_valid(self, form):
        # TODO do something

        return super(YourFinancesView, self).form_valid(form)


class ResultView(TemplateView):
    template_name = 'checker/result.html'
