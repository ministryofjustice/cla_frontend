import json

from django.shortcuts import render
from django.http import HttpResponse

from api.client import get_connection

from cla_auth.utils import call_centre_zone_required

from legalaid.shortcuts import get_eligibility_or_404

from cla_common.templatetags.means_summary_tags import MeansSummaryFormatter


@call_centre_zone_required
def dashboard(request):
    return render(request, 'call_centre/dashboard.html', {})


@call_centre_zone_required
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