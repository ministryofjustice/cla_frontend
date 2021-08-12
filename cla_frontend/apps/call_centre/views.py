from django.shortcuts import render
from django.conf import settings

from cla_auth.utils import call_centre_zone_required


@call_centre_zone_required
def dashboard(request):
    return render(request, "call_centre/angular_app.html", {"family_issue_flag": settings.FAMILY_ISSUE_FEATURE_FLAG})
