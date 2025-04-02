from django.shortcuts import render
from django.conf import settings

from cla_auth.utils import call_centre_zone_required


@call_centre_zone_required
def dashboard(request):
    return render(request, "call_centre/angular_app.html", {"cla_features": get_enabled_feature_flags()})


def get_enabled_feature_flags():
    flags = {
        "family_issue_flag": settings.FAMILY_ISSUE_FEATURE_FLAG,
        "new_client_note_flag": settings.NEW_CLIENT_NOTE_FEATURE_FLAG,
    }
    enabled = []
    for name, value in flags.items():
        if value:
            enabled.append(name)

    return enabled
