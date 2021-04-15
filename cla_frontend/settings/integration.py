from .base import *


DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (("Marco Fucci", "marco.fucci@digital.justice.co.uk"), ("Rai Kotecha", "ravi.kotecha@digital.justice.gov.uk"))

MANAGERS = ADMINS

HOST_NAME = "http://cla-frontend.dsd.io"

BACKEND_BASE_URI = "http://cla-backend.dsd.io"

STATICFILES_STORAGE = "django.contrib.staticfiles.storage.CachedStaticFilesStorage"
