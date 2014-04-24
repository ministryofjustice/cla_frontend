from django.shortcuts import render, redirect

from api.client import get_connection
from cla_auth.utils import cla_provider_zone_required

from legalaid.shortcuts import get_case_or_404

from .forms import RejectCaseForm


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

    context = {
        'case_reference': case_reference,
        'case': case,
        'eligibility_check': client.eligibility_check(case['eligibility_check']).get()
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
            return redirect('cla_provider:dashboard')
    else:
        form = RejectCaseForm(client=client)

    return render(request, 'cla_provider/reject_case.html', {
        'case_reference': case_reference,
        'case': case,
        'form': form
    })
