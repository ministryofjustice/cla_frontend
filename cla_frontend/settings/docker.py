from .base import *  # noqa: F403, F401
import os


ADMINS = (("CLA", "cla-alerts@digital.justice.gov.uk"),)

MANAGERS = ADMINS

HOST_NAME = os.environ.get("HOST_NAME", "localhost")

STATICFILES_STORAGE = "django.contrib.staticfiles.storage.CachedStaticFilesStorage"

# LOGGING CONFIG FOR DOCKER ENV
LOGGING["filters"] = {  # noqa: F405
    "require_debug_false": {"()": "django.utils.log.RequireDebugFalse"},
    "require_debug_true": {"()": "django.utils.log.RequireDebugTrue"},
}

LOGGING["handlers"]["mail_admins"] = {  # noqa: F405
    "level": "ERROR",
    "class": "django.utils.log.AdminEmailHandler",
    "filters": ["require_debug_false"],
}

LOGGING["handlers"]["production_file"] = {  # noqa: F405
    "level": "INFO",
    "class": "logging.handlers.RotatingFileHandler",
    "filename": "/var/log/wsgi/app.log",
    "maxBytes": 1024 * 1024 * 5,  # 5 MB
    "backupCount": 7,
    "formatter": "logstash",
    "filters": ["require_debug_false"],
}

LOGGING["handlers"]["debug_file"] = {  # noqa: F405
    "level": "DEBUG",
    "class": "logging.handlers.RotatingFileHandler",
    "filename": "/var/log/wsgi/debug.log",
    "maxBytes": 1024 * 1024 * 5,  # 5 MB
    "backupCount": 7,
    "formatter": "verbose",
    "filters": ["require_debug_true"],
}

LOGGING["loggers"][""] = {"handlers": ["production_file", "debug_file"], "level": "DEBUG"}  # noqa: F405
LOGGING["loggers"]["django.request"] = {"handlers": ["mail_admins"], "level": "ERROR", "propagate": True}  # noqa: F405
