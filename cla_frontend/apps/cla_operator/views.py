import json

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse

from api.client import get_connection

from call_centre.forms import SearchCaseForm
from cla_auth.utils import call_centre_zone_required

from legalaid.shortcuts import get_case_or_404

from cla_common.templatetags.means_summary_tags import MeansSummaryFormatter


@call_centre_zone_required
def dashboard(request):
    client = get_connection(request)
    form = SearchCaseForm(client=client)
    cases = form.search(q=request.GET.get('q'))

    return render_to_response('cla_operator/dashboard.html', {
        'cases': cases
    }, RequestContext(request))


@call_centre_zone_required
def case_means_summary(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)
    eligibility_check = client.eligibility_check(case['eligibility_check']).get()

    formatter = MeansSummaryFormatter()
    output = formatter.format(eligibility_check)

    class SmartEncoder(json.JSONEncoder):
        def default(self, obj):
            if hasattr(obj, '__promise__'):
                return unicode(obj)
            return json.JSONEncoder.default(self, obj)

    return HttpResponse(json.dumps(output, cls=SmartEncoder), content_type="application/json")
