from .base import *

# Overwriting BACKEND_BASE_URI will have no effect unless the ZONE_PROFILES dict is updated with the new value

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
