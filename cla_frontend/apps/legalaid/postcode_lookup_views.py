# coding=utf-8
from cla_common.address_lookup.ordnance_survey import FormattedAddressLookup
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse


@login_required
def postcode_lookup(request, path):
    postcode = request.GET.get("postcode")
    key = settings.OS_PLACES_API_KEY
    formatted_addresses = FormattedAddressLookup(key=key).by_postcode(postcode)
    if formatted_addresses:
        response = [{"formatted_address": address} for address in formatted_addresses if address]
        return JsonResponse(response, safe=False)
    return JsonResponse([], safe=False, status=404)
