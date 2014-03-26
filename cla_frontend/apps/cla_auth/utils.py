from django.conf import settings


def get_auth_profile(auth_app):
    return settings.AUTH_APPS_PROFILES.get(auth_app)
