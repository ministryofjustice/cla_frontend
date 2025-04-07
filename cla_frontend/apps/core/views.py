from django.views.generic import TemplateView, View
from django.conf import settings
from django.http import JsonResponse


class MaintenanceModeView(TemplateView):
    template_name = "maintenance.html"

    def dispatch(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context, status=503)


class FeatureFlagView(View):

    def dispatch(self, request, *args, **kwargs):
        flags = {
            "new_client_note_flag": settings.NEW_CLIENT_NOTE_FEATURE_FLAG,
        }
        
        return JsonResponse(flags)