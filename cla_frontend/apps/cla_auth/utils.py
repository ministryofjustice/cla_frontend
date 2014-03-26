from django.conf import settings


def get_zone_profile(zone_name):
    return settings.ZONE_PROFILES.get(zone_name)
