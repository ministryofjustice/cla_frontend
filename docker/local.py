from .base import *


DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Marco Fucci', 'marco.fucci@digital.justice.co.uk'),
    ('Rai Kotecha', 'ravi.kotecha@digital.justice.gov.uk'),
)

MANAGERS = ADMINS


HOST_NAME = "http://frontend-qa.cla.dsd.io"

BACKEND_BASE_URI = 'http://ip-172-31-27-7.eu-west-1.compute.internal'

ZONE_PROFILES = {
    'call_centre': {
        'CLIENT_ID': 'b4b9220ffcb11ebfdab1',
        'CLIENT_SECRET': '2df71313bdd38a2e1b815015e1b14387e7681d41',
        'LOGIN_REDIRECT_URL': 'call_centre:dashboard',
        'BASE_URI': '%s/call_centre/api/v1/' % BACKEND_BASE_URI,
        'AUTHENTICATION_BACKEND': 'call_centre.backend.CallCentreBackend'
    },

    'cla_provider': {
        'CLIENT_ID': '59657ed22d980251cdd3',
        'CLIENT_SECRET': '0494287c65bdf61d29f0eeed467ec8e090f0d80f',
        'LOGIN_REDIRECT_URL': 'cla_provider:dashboard',
        'BASE_URI': '%s/cla_provider/api/v1/' % BACKEND_BASE_URI,
        'AUTHENTICATION_BACKEND': 'cla_provider.backend.ClaProviderBackend'
    }
}
