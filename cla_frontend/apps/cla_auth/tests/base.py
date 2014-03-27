from django.conf import settings


DEFAULT_ZONE_NAME = settings.ZONE_PROFILES.keys()[0]
DEFAULT_ZONE_PROFILE = settings.ZONE_PROFILES[DEFAULT_ZONE_NAME]
