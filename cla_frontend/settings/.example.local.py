from .base import *

# If the backend ports need to be changed locally or in the Docker file, changing BACKEND_BASE_URI has no effect,
# as the address is written to ZONE_PROFILES before being read from this file.
# To point the backend to an address besides "127.0.0.1:8000" either alter your environment variables or overwrite
# the ZONE_PROFILES dict with the new backend address by adding it to this file.

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DEV_APPS = ("django_pdb",)

INSTALLED_APPS += DEV_APPS

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {"require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}},
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        }
    },
    "loggers": {"django.request": {"handlers": ["mail_admins"], "level": "ERROR", "propagate": True}},
}
