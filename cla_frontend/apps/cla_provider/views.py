from api.client import get_connection
from django.shortcuts import render

from cla_auth.utils import cla_provider_zone_required


@cla_provider_zone_required
def dashboard(request):
    return render(request, 'cla_provider/dashboard.html', {})


def legal_help_form(request, case_reference):
    client = get_connection(request)
    extract = client.case(case_reference).legal_help_form_extract.get()

    ec = extract['eligibility_check']
    ec.update({
        'main_property': None,
        'additional_SMOD_property': None,
        'additional_non_SMOD_property': None
    })
    for prop in ec['property_set']:
        if prop['main']:
            ec['main_property'] = prop
        else:
            if prop['disputed']:
                ec['additional_SMOD_property'] = prop
            else:
                ec['additional_non_SMOD_property'] = prop

    return render(request, 'cla_provider/legal_help_form.jade', extract)
