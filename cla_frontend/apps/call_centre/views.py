from django.contrib import messages
from django.shortcuts import render_to_response, redirect, render
from django.template import RequestContext
from django.views.decorators.http import require_POST

from api.client import get_connection
from cla_auth.utils import call_centre_zone_required
from core.exceptions import RemoteValidationError
from legalaid.shortcuts import get_case_or_404

from .forms import CaseForm, CaseAssignForm, CaseCloseForm, \
    PersonalDetailsForm, SearchCaseForm


@call_centre_zone_required
def dashboard(request):
    client = get_connection(request)
    form = SearchCaseForm(client=client)
    cases = form.search(q=request.GET.get('q'))

    return render_to_response('call_centre/dashboard.html', {
        'cases': cases
    }, RequestContext(request))


@call_centre_zone_required
def edit_case(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)
    eligibility_check = client.eligibility_check(case['eligibility_check']).get()

    if request.method == 'POST':
        case_edit_form = CaseForm(request.POST, client=client)

        if case_edit_form.is_valid():
            case_edit_form.save(case_reference, case['eligibility_check'])

            return redirect('call_centre:edit_case', case_reference=case_reference)
    else:
        case_edit_form = CaseForm(
            initial={
                'eligibility_check': eligibility_check,
                'case_notes': case
            }, client=client
        )

    return render(request, 'call_centre/edit_case.html', {
        'case_reference': case_reference,
        'case': case,
        'eligibility_check': eligibility_check,
        'form': case_edit_form
    })


@call_centre_zone_required
def edit_case_personal_details(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = PersonalDetailsForm(request.POST, client=client)

        if form.is_valid():
            form.save(case_reference)
            return redirect('call_centre:edit_case_personal_details', case_reference)
    else:
        form = PersonalDetailsForm(
            initial=case.get('personal_details'),
            client=client
        )

    return render(request, 'call_centre/edit_case_personal_details.html', {
        'case_reference': case_reference,
        'case': case,
        'form': form
    })


@call_centre_zone_required
@require_POST
def create_case(request):
    client = get_connection(request)
    resp = client.case.post()
    return redirect('call_centre:edit_case', resp.get('reference'))


@call_centre_zone_required
def assign_case(request, case_reference):
    """
    to assign to a cla_provider, should post a
    provider with id of provider to assign to
    """
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = CaseAssignForm(request.POST, client=client)

        if form.is_valid():
            provider = None
            try:
                provider = form.save(case_reference)
                msg = ('Case {case_ref} successfully assigned'
                       ' to {provider_name} with shortcode {shortcode}'
                ).format(
                    case_ref=case_reference, provider_name=provider['name'],
                    shortcode=provider['short_code']
                )
                messages.add_message(request, messages.INFO, msg)
                return redirect('call_centre:dashboard')
            except RemoteValidationError as e:
                pass
    else:
        form = CaseAssignForm(client=client)

    return render(request, 'call_centre/assign_case.html', {
        'form': form,
        'case': case
    })


@call_centre_zone_required
def close_case(request, case_reference):
    """
    Closes a case, outcome required.
    """
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = CaseCloseForm(request.POST, client=client)

        if form.is_valid():
            form.save(case_reference)
            messages.add_message(request, messages.INFO,
                'Case {case_ref} close successfully'.format(case_ref=case_reference)
            )
            return redirect('call_centre:dashboard')
    else:
        form = CaseCloseForm(client=client)

    return render(request, 'call_centre/close_case.html', {
        'form': form,
        'case': case
    })
