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
    case = client.case(case_reference).get()
    if len(case) == 1:
        case = case[0]
    if request.method == 'POST':
        case_edit_form = CaseForm(request.POST)

        if case_edit_form.is_valid():
            data = case_edit_form.save()
            client.case(case_reference).patch(data)
            return redirect('call_centre:dashboard')
        else:
            context['form'] = case_edit_form
            return render(request, 'call_centre/edit_case.html', context)
    else:
        context['form'] = CaseForm(initial=case)
        return render(request, 'call_centre/edit_case.html', context)

@login_required
@require_POST
def create_case(request):
    client = get_connection(request)
    resp = client.case.post()
    return redirect('call_centre:edit_case', resp.get('reference'))
