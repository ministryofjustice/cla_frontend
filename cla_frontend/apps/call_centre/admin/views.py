from django.shortcuts import render

from cla_auth.utils import call_centre_zone_required, manager_member_required


@call_centre_zone_required
@manager_member_required
def rota(request):
    return render(request, 'call_centre/admin/rota.html')
