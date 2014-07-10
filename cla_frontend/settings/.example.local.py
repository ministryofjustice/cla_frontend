from .base import *

DEV_APPS = (
    'django_extensions',
    'debug_toolbar',
    'django_pdb'
)

INSTALLED_APPS += DEV_APPS

if DEBUG:
  CSP_DEFAULT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", 'ajax.googleapis.com', 'data:')