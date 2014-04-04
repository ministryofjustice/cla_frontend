from django import forms
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, redirect, render
from django.template import RequestContext
from django.views.decorators.http import require_POST
from api.client import get_connection
from call_centre.forms import CaseForm


@login_required
def dashboard(request):
    client = get_connection(request)
    cases = client.case.get()
    return render_to_response('call_centre/dashboard.html', {
        'cases': cases
    }, RequestContext(request))




@login_required
def edit_case(request, case_reference):
    context = {'case_reference': case_reference}
    client = get_connection(request)
    # TODO should be atomic...? rev_id
    case = client.case(case_reference).get()
    eligibility_check = client.eligibility_check(case['eligibility_check']).get()
    context['case'] = case
    context['eligibility_check'] = eligibility_check
    if request.method == 'POST':
        case_edit_form = CaseForm(request.POST, client=client)

        if case_edit_form.is_valid():
            data = case_edit_form.cleaned_data
            eligibility_check = data.pop('eligibility_check')
            client.case(case_reference).patch(data)
            client.eligibility_check(case['eligibility_check']).patch(eligibility_check)
            return redirect('call_centre:dashboard')
        else:
            context['form'] = case_edit_form
            return render(request, 'call_centre/edit_case.html', context)
    else:
        context['form'] = CaseForm(
            initial=
                {'eligibility_check': eligibility_check,
                'personal_details': case.get('personal_details')},
            client=client
        )
        return render(request, 'call_centre/edit_case.html', context)

@login_required
@require_POST
def create_case(request):
    client = get_connection(request)
    resp = client.case.post()
    return redirect('call_centre:edit_case', resp.get('reference'))
