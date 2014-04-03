from .base import *


DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Marco Fucci', 'marco.fucci@digital.justice.co.uk'),
    ('Rai Kotecha', 'ravi.kotecha@digital.justice.gov.uk'),
)

MANAGERS = ADMINS


HOST_NAME = "http://cla-frontend.dsd.io"

BACKEND_BASE_URI = 'http://cla-backend.dsd.io'

ZONE_PROFILES = {
    'call_centre': {
        'CLIENT_ID': 'call_centre_client',
        'CLIENT_SECRET': 'call_centre_secret',
        'LOGIN_REDIRECT_URL': 'call_centre:dashboard',
        'BASE_URI': '%s/call_centre/api/v1/' % BACKEND_BASE_URI,
        'AUTHENTICATION_BACKEND': 'call_centre.backend.CallCentreBackend'
    },

    'cla_provider': {
        'CLIENT_ID': 'provider_client',
        'CLIENT_SECRET': 'provider_secret',
        'LOGIN_REDIRECT_URL': 'cla_provider:dashboard',
        'BASE_URI': '%s/cla_provider/api/v1/' % BACKEND_BASE_URI,
        'AUTHENTICATION_BACKEND': 'cla_provider.backend.ClaProviderBackend'
    }
}
