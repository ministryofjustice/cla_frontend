from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.template import RequestContext
from api.client import get_connection


@login_required
def dashboard(request):
    client = get_connection(request)
    cases = client.case.get()
    return render(request, 'cla_provider/dashboard.html', {
        'cases': cases
    })

@login_required
def edit_case(request, case_reference):
    context = {'case_reference': case_reference}
    client = get_connection(request)
    # TODO should be atomic...? rev_id
    case = client.case(case_reference).get()
    context['case'] = case
    context['eligibility_check'] = client.eligibility_check(case['eligibility_check']).get()
    return render(request, 'cla_provider/edit_case.html', context)
