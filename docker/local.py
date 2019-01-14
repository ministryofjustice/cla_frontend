from .base import *  # noqa: F401,F403
import os

SECRET_KEY = os.environ["SECRET_KEY"]

DEBUG = bool(os.environ.get("DEBUG", False))

ALLOWED_HOSTS = os.environ["ALLOWED_HOSTS"].split(",")

TEMPLATE_DEBUG = DEBUG

ADMINS = (("Marco Fucci", "marco.fucci@digital.justice.co.uk"), ("Rai Kotecha", "ravi.kotecha@digital.justice.gov.uk"))

MANAGERS = ADMINS


HOST_NAME = os.environ["HOST_NAME"]

BACKEND_BASE_URI = os.environ["BACKEND_BASE_URI"]

ZONE_PROFILES = {
    "call_centre": {
        "CLIENT_ID": os.environ.get("CALL_CENTRE_CLIENT_ID"),
        "CLIENT_SECRET": os.environ.get("CALL_CENTRE_SECRET_ID"),
        "LOGIN_REDIRECT_URL": "call_centre:dashboard",
        "BASE_URI": "%s/call_centre/api/v1/" % BACKEND_BASE_URI,
        "AUTHENTICATION_BACKEND": "call_centre.backend.CallCentreBackend",
    },
    "cla_provider": {
        "CLIENT_ID": os.environ.get("CLA_PROVIDER_CLIENT_ID"),
        "CLIENT_SECRET": os.environ.get("CALL_PROVIDER_SECRET_ID"),
        "LOGIN_REDIRECT_URL": "cla_provider:dashboard",
        "BASE_URI": "%s/cla_provider/api/v1/" % BACKEND_BASE_URI,
        "AUTHENTICATION_BACKEND": "cla_provider.backend.ClaProviderBackend",
    },
}
