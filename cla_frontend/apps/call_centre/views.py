from django.shortcuts import render

from cla_auth.utils import call_centre_zone_required


@call_centre_zone_required
def dashboard(request):
    return render(request, 'call_centre/angular_app.html', {})
