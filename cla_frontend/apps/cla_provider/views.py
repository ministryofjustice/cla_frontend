from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.contrib import messages

from api.client import get_connection
from cla_auth.utils import cla_provider_zone_required

from legalaid.shortcuts import get_case_or_404
from cla_common.constants import REQUIRES_ACTION_BY

from .forms import RejectCaseForm, AcceptCaseForm, CaseForm, CloseCaseForm


@cla_provider_zone_required
def dashboard(request):
    client = get_connection(request)

    cases = []
    q = request.GET.get('q')
    if q:
        cases = client.case.get(search=q)
    else:
        cases = client.case.get()
    return render(request, 'cla_provider/dashboard.html', {
        'cases': cases
    })

@cla_provider_zone_required
def edit_case(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        case_form = CaseForm(client=client, data=request.POST)
        if case_form.is_valid():
            case_form.save(case_reference)
            return redirect('.')
    else:
        case_form = CaseForm(client=client, initial=case)


    # getting eligibility check object only if it exists
    eligibility_check = None
    if case['eligibility_check']:
        client.eligibility_check(case['eligibility_check']).get()

    context = {
        'case_reference': case_reference,
        'case': case,
        'case_form': case_form,
        'eligibility_check': eligibility_check,
        'accept_form': AcceptCaseForm(client=client),
        'in_review': case['requires_action_by'] == REQUIRES_ACTION_BY.PROVIDER_REVIEW  # TODO not looking great, refactor
    }
    return render(request, 'cla_provider/edit_case.html', context)


@cla_provider_zone_required
def reject_case(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = RejectCaseForm(client=client, data=request.POST)

        if form.is_valid():
            form.save(case_reference)

            messages.add_message(request, messages.INFO,
                'Case {case_ref} rejected successfully'.format(case_ref=case_reference)
            )
            return redirect('cla_provider:dashboard')
    else:
        form = RejectCaseForm(client=client)

    return render(request, 'cla_provider/reject_case.html', {
        'case_reference': case_reference,
        'case': case,
        'form': form
    })


@cla_provider_zone_required
@require_POST
def accept_case(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    form = AcceptCaseForm(client=client, data=request.POST)

    if form.is_valid():
        form.save(case_reference)
        messages.add_message(request, messages.INFO,
            'Case {case_ref} accepted successfully'.format(case_ref=case_reference)
        )
    else:
        messages.add_message(request, messages.ERROR,
            'Cannot accept Case {case_ref}'.format(case_ref=case_reference)
        )
    return redirect('cla_provider:edit_case', case_reference)


@cla_provider_zone_required
def close_case(request, case_reference):
    client = get_connection(request)
    case = get_case_or_404(client, case_reference)

    if request.method == 'POST':
        form = CloseCaseForm(client=client, data=request.POST)

        if form.is_valid():
            form.save(case_reference)

            messages.add_message(request, messages.INFO,
                'Case {case_ref} closed successfully'.format(case_ref=case_reference)
            )
            return redirect('cla_provider:dashboard')
    else:
        form = CloseCaseForm(client=client)

    return render(request, 'cla_provider/close_case.html', {
        'case_reference': case_reference,
        'case': case,
        'form': form
    })
