from .base import *

DEV_APPS = (
    # 'django_extensions',
    # 'debug_toolbar',
    'django_pdb',
)

INSTALLED_APPS += DEV_APPS

CSP_DEFAULT_SRC = list(CSP_DEFAULT_SRC) + ['localhost:8005']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

ZENDESK_API_USERNAME = os.environ.get(
    'ZENDESK_API_USERNAME',
    '<Zendesk user email>')
ZENDESK_API_TOKEN = os.environ.get(
    'ZENDESK_API_TOKEN',
    '<Zendesk API token>')
