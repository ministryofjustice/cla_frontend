import json

from django.shortcuts import redirect
from django.conf import settings
from django.http import HttpResponse

from api.client import get_connection

from cla_common.templatetags.means_summary_tags import MeansSummaryFormatter

from cla_auth import get_zone

from legalaid.shortcuts import get_eligibility_or_404


def home(request):
    """
    Redirects to LOGIN if the user is not logged in, otherwise, it redirects
    to the appropriate dashboard page
    """
    if not request.user.is_authenticated():
        return redirect(settings.LOGIN_URL)

    zone = get_zone(request)
    return redirect(zone['LOGIN_REDIRECT_URL'])


def case_means_summary(request, case_reference):
    client = get_connection(request)
    eligibility_check = get_eligibility_or_404(client, case_reference)

    formatter = MeansSummaryFormatter()
    output = formatter.format(eligibility_check)

    class SmartEncoder(json.JSONEncoder):
        def default(self, obj):
            if hasattr(obj, '__promise__'):
                return unicode(obj)
            return json.JSONEncoder.default(self, obj)

    return HttpResponse(json.dumps(output, cls=SmartEncoder), content_type="application/json")
