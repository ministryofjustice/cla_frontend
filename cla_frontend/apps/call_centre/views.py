from cla_auth.utils import call_centre_zone_required
from django.contrib import messages
from django.shortcuts import render_to_response, redirect, render
from django.template import RequestContext
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.http import require_POST

from api.client import get_connection
from cla_auth.utils import call_centre_zone_required
from legalaid.shortcuts import get_case_or_404

from .forms import CaseForm, CaseAssignForm, CaseCloseForm, \
    PersonalDetailsForm


@call_centre_zone_required
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


@call_centre_zone_required
def edit_case(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)
    eligibility_check = client.eligibility_check(case['eligibility_check']).get()

    context = {
        'case_reference': case_reference,
        'case': case,
        'eligibility_check': eligibility_check
    }

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

@call_centre_zone_required
def edit_case_personal_details(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    context = {
        'case_reference': case_reference,
        'case': case
    }

    if request.method == 'POST':
        personal_details_edit_form = PersonalDetailsForm(request.POST)

        if personal_details_edit_form.is_valid():
            data = personal_details_edit_form.cleaned_data
            client.case(case_reference).patch({'personal_details':data})
            return redirect('call_centre:edit_case_personal_details', case_reference)
        else:
            context['form'] = personal_details_edit_form
            return render(request, 'call_centre/edit_case_personal_details.html', context)
    else:
        context['form'] = PersonalDetailsForm(
            initial= case.get('personal_details'),
        )
        return render(request, 'call_centre/edit_case_personal_details.html', context)


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

            provider = form.save(case_reference)
            # TODO - internationalisation?
            msg = ('Case {case_ref} successfully assigned'
                   ' to {provider_name} with shortcode {shortcode}'
                   ).format(
                        case_ref=case_reference, provider_name=provider['name'],
                        shortcode=provider['short_code']
                    )
            messages.add_message(request, messages.INFO, msg)
            return redirect('call_centre:dashboard')
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
        'form': form
    })
