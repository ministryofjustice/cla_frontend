from django import forms
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, redirect, render
from django.template import RequestContext
from django.views.decorators.http import require_POST
from api.client import get_connection


@login_required
def dashboard(request):
    client = get_connection(request)
    cases = client.case.get()
    return render_to_response('call_centre/dashboard.html', {
        'cases': cases
    }, RequestContext(request))


class CaseEditForm(forms.Form):
    reference = forms.CharField(max_length=35)


@login_required
def edit_case(request, case_ref):
    client = get_connection(request)
    case = client.case(case_ref).get()
    if len(case) == 1:
        case = case[0]
    if request.method == 'POST':
        case_edit_form = CaseEditForm(request.POST)
        if case_edit_form.is_valid():
            client.case(case_ref).patch(case_edit_form.cleaned_data)
            return redirect('call_centre:dashboard')
        else:
            return render(request, 'call_centre/edit_case.html', {'form': case_edit_form})
    else:
        case_edit_form = CaseEditForm(data=case)
        return render(request, 'call_centre/edit_case.html', {'form': case_edit_form})

@login_required
@require_POST
def create_case(request):
    client = get_connection(request)
    resp = client.case.post()
    return redirect(request, 'call_centre:edit_case', resp.get('reference'))
