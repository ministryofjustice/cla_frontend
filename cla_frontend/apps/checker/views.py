from django.views.generic import TemplateView


class YourProblemView(TemplateView):
    template_name = 'checker/your_problem.html'


class YourDetailsView(TemplateView):
    template_name = 'checker/your_details.html'


class YourFinancesView(TemplateView):
    template_name = 'checker/your_finances.html'
