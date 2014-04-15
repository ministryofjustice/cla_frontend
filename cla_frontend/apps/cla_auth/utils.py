from django.conf import settings


def get_zone_profile(zone_name):
    zone = dict(settings.ZONE_PROFILES.get(zone_name))
    zone['name'] = zone_name
    return zone
