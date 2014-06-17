import json

from django.shortcuts import render_to_response, render
from django.http import HttpResponse

from api.client import get_connection

from cla_auth.utils import call_centre_zone_required
from django.views.decorators.csrf import csrf_exempt

from legalaid.shortcuts import get_case_or_404

from cla_common.templatetags.means_summary_tags import MeansSummaryFormatter
from proxy.views import proxy_view


@call_centre_zone_required
def dashboard(request):
    return render(request, 'call_centre/dashboard.html', {})


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

@csrf_exempt
def backend_proxy_view(request, path):
    """
        TODO: hacky as it's getting the base_url and the auth header from the
            get_connection slumber object.

            Also, we should limit the endpoint accessible from this proxy
    """
    client = get_connection(request)

    extra_requests_args = {
        'headers': dict([client._store['session'].auth.get_header()])
    }
    remoteurl = u"%s%s" % (client._store['base_url'], path)
    return proxy_view(request, remoteurl, extra_requests_args)
