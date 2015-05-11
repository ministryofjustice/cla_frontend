import urllib

from django.conf import settings
import requests


def query(path, **kwargs):
    return requests.get(
        "{host}/{path}?{args}".format(
            host=settings.ADDRESSFINDER_API_HOST,
            path=path,
            args=urllib.urlencode(kwargs)),
        headers={
            'Authorization': 'Token %s' % settings.ADDRESSFINDER_API_TOKEN},
        timeout=(2.0, 5.0))


def lookup_postcode(postcode):
    return query('addresses/', postcode=postcode)
