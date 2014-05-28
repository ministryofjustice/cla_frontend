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
    context = { 'case': case }
                
    if request.method == 'POST':
        form = CaseAssignForm(request.POST, client=client)

        if form.is_valid():
            provider = None
            try:
                provider = form.save(case_reference)

                # A redirect would be more correct after a POST but would require the
                # operator to have access to the case after it has been assigned to
                # the provider.
                context['provider'] = provider
                return render(request, 'call_centre/assign_case_complete.html', context)

            except RemoteValidationError as rve:
                pass
    else:
        assign_suggestions = client.case(case_reference).assign_suggest().get()
        form = CaseAssignForm(client=client,
                              initial={'providers' : assign_suggestions['suggested_provider']['id']}
                              )

        all_providers = [(y['id'], y['name']) for y in [assign_suggestions['suggested_provider'],]+ assign_suggestions['other_providers']]
        form.fields['providers'].choices = all_providers

        # NEXT - hidden field

        # u'suggested_provider' and list of u'other_providers'
        context.update(assign_suggestions)
        

    context['form'] = form
    return render(request, 'call_centre/assign_case.html', context)


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
