from django.shortcuts import render
from django.http.response import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from api.client import get_connection

from slumber.exceptions import HttpClientError
from cla_auth.utils import cla_provider_zone_required
from cla_auth.views import backend_proxy_view

from cla_common.constants import DISREGARDS, SPECIFIC_BENEFITS


@cla_provider_zone_required
def dashboard(request):
    return render(request, "cla_provider/angular_app.html", {"cla_features": get_enabled_feature_flags(request.user)})


def get_enabled_feature_flags(user):
    allowed_offices = settings.XML_EXPORT_BUTTON_OFFICE_CODES
    flags = {
        "xml_export_button": any(code in allowed_offices for code in user.office_codes)
    }
    return [name for name, value in flags.items() if value]


@csrf_exempt
@cla_provider_zone_required
def case_export_proxy(request):
    zone = settings.ZONE_PROFILES.get("cla_provider", {})
    is_entra_user = hasattr(request.user, "_me_data")
    use_auth_header = not is_entra_user or "xml_export_button" in get_enabled_feature_flags(request.user)
    print("is_entra:", is_entra_user, "use_auth_header:", use_auth_header)
    return backend_proxy_view(
        request,
        path="caseExport/",
        use_auth_header=use_auth_header,
        base_remote_url=zone.get("BASE_URI"),
    )


@cla_provider_zone_required
def legal_help_form(request, case_reference):
    client = get_connection(request)

    try:
        extract = client.case(case_reference).legal_help_form_extract.get()

        ec = extract["eligibility_check"]
        calculations = ec.get("calculations") or {}

        # Conditions for Jade template. Jade templates doesn't work with conditions very well
        if ec["is_you_under_18"] and not ec["under_18_receive_regular_payment"]:
            ec["under_18_investments_totalling"] = True

        # any specific benefits === True ?!
        has_any_specific_benefits = False
        if ec["on_passported_benefits"] and ec["specific_benefits"]:
            has_any_specific_benefits = any(ec["specific_benefits"].values())

        has_any_disregards = False
        if ec["disregards"]:
            has_any_disregards = any(ec["disregards"].values())

        ec.update(
            {
                "main_property": None,
                "additional_SMOD_property": None,
                "additional_non_SMOD_property": None,
                "has_any_specific_benefits": has_any_specific_benefits,
                "all_benefits": SPECIFIC_BENEFITS,
                "has_any_disregards": has_any_disregards,
                "all_disregards": DISREGARDS,
            }
        )

        property_set = ec.get("property_set", [])
        property_equities = calculations.get("property_equities") or [0] * len(property_set)
        for prop, equity in zip(property_set, property_equities):
            if prop["main"]:
                ec["main_property"] = prop
                ec["main_property"]["equity"] = equity
            else:
                if prop["disputed"]:
                    ec["additional_SMOD_property"] = prop
                    ec["additional_SMOD_property"]["equity"] = equity
                else:
                    ec["additional_non_SMOD_property"] = prop
                    ec["additional_non_SMOD_property"]["equity"] = equity

        return render(request, "cla_provider/legal_help_form.jade", extract)

    except HttpClientError as e:
        return HttpResponse(status=e.response.status_code, content=e.response.reason)
