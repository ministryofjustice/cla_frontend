from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, redirect, render
from django.template import RequestContext
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.http import require_POST

from api.client import get_connection

from .forms import CaseForm, CaseAssignForm, CaseCloseForm, CaseUnlockForm


@login_required
def dashboard(request):
    client = get_connection(request)
    cases = []
    q = request.GET.get('q')
    if q:
        cases = client.case.get(search=q)
    else:
        cases = client.case.get()
    return render_to_response('call_centre/dashboard.html', {
        'cases': cases
    }, RequestContext(request))


@login_required
def edit_case(request, case_reference):
    context = {'case_reference': case_reference}
    client = get_connection(request)

    case = client.case(case_reference).get()
    eligibility_check = client.eligibility_check(case['eligibility_check']).get()
    context['case'] = case
    context['eligibility_check'] = eligibility_check
    context['assign_form'] = CaseAssignForm(client=client)
    context['close_form'] = CaseCloseForm(client=client)
    context['unlock_form'] = CaseUnlockForm(client=client)

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


@login_required
@require_POST
def assign_case(request, case_reference):
    """
    to assign to a cla_provider, should post a
    provider with id of provider to assign to
    """
    # TODO complete this, different page?
    client = get_connection(request)
    assign_form = CaseAssignForm(request.POST, client=client)

    if assign_form.is_valid():
        assign_form.save(case_reference)
        return redirect('call_centre:dashboard')
    else:
        from django.contrib import messages
        messages.add_message(request,
                             messages.INFO,
                             _('Could not assign case {case_ref} to provider.'.format(case_ref=case_reference)))
        return redirect('call_centre:edit_case', case_reference)


@login_required
@require_POST
def close_case(request, case_reference):
    """
    this should actually set a 'reason code' for closure
    and assign to provider
    """
    client = get_connection(request)
    form = CaseCloseForm(request.POST, client=client)

    if form.is_valid():
        form.save(case_reference)
        return redirect('call_centre:dashboard')
    else:
        from django.contrib import messages
        messages.add_message(request,
                             messages.INFO,
                             _('Could not close case {case_ref}.'.format(case_ref=case_reference)))
        return redirect('call_centre:edit_case', case_reference)


@login_required
@require_POST
def unlock_case(request, case_reference):
    """
    Unlocks a case, outcome required.
    """
    # TODO complete this, different page?
    client = get_connection(request)
    form = CaseUnlockForm(request.POST, client=client)

    if form.is_valid():
        form.save(case_reference)
        return redirect('call_centre:dashboard')
    else:
        from django.contrib import messages
        messages.add_message(request,
                             messages.INFO,
                             _('Could not unlock case {case_ref}.'.format(case_ref=case_reference)))
        return redirect('call_centre:edit_case', case_reference)
