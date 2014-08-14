from django.shortcuts import render

from cla_auth.utils import cla_provider_zone_required


@cla_provider_zone_required
def dashboard(request):
    return render(request, 'cla_provider/dashboard.html', {})