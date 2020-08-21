from django.views.generic import TemplateView


class MaintenanceModeView(TemplateView):
    template_name = "maintenance.html"

    def dispatch(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context, status=503)
