from api.client import get_connection
from call_centre.forms import SearchCaseForm
from cla_auth.utils import call_centre_zone_required
from django.shortcuts import render_to_response
from django.template import RequestContext

@call_centre_zone_required
def dashboard(request):
    client = get_connection(request)
    form = SearchCaseForm(client=client)
    cases = form.search(q=request.GET.get('q'))

    return render_to_response('cla_operator/dashboard.html', {
        'cases': cases
    }, RequestContext(request))
