from django.contrib import messages
from django.shortcuts import render_to_response, redirect, render
from django.template import RequestContext
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

from proxy.views import proxy_view

from api.client import get_connection
from cla_auth.utils import call_centre_zone_required
from core.exceptions import RemoteValidationError
from legalaid.shortcuts import get_case_or_404

from .forms import CaseForm, CaseAssignForm, CaseCloseForm, \
    PersonalDetailsForm, SearchCaseForm, DeclineSpecialistsCaseForm, \
    DeferAssignCaseForm


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

                # A redirect would be more correct after a POST but would require the
                # operator to have access to the case after it has been assigned to
                # the provider.
                context = {'provider': provider,
                           'case': case
                           }
                return render(request, 'call_centre/assign_case_complete.html', context)

            except RemoteValidationError as rve:
                pass
    else:
        form = CaseAssignForm(client=client)

    return render(request, 'call_centre/assign_case.html', {
        'form': form,
        'case': case
    })

@call_centre_zone_required
def defer_assignment(request, case_reference):
    """
    Defers assignment to provider
    """
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = DeferAssignCaseForm(request.POST, client=client)

        if form.is_valid():
            form.save(case_reference)
            messages.add_message(request, messages.INFO,
                                 'Case {case_ref} deferred successfully'.format(case_ref=case_reference)
            )
            return redirect('call_centre:dashboard')
    else:
        form = DeferAssignCaseForm(client=client)

    return render(request, 'call_centre/defer_assignment.html', {
        'form': form,
        'case': case
    })

@call_centre_zone_required
def decline_specialists(request, case_reference):
    """
    Declines all specialists providers
    """
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = DeclineSpecialistsCaseForm(request.POST, client=client)

        if form.is_valid():
            form.save(case_reference)
            messages.add_message(request, messages.INFO,
                'Case {case_ref} close successfully'.format(case_ref=case_reference)
            )
            return redirect('call_centre:dashboard')
    else:
        form = DeclineSpecialistsCaseForm(client=client)

    return render(request, 'call_centre/decline_specialists.html', {
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


