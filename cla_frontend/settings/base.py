import sys
import os
from os.path import join, abspath, dirname

# PATH vars

here = lambda *x: join(abspath(dirname(__file__)), *x)
PROJECT_ROOT = here("..")
root = lambda *x: join(abspath(PROJECT_ROOT), *x)

APPS_ROOT = root('apps')

sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, APPS_ROOT)

HEALTHCHECKS = [
    'status.healthchecks.backend_healthcheck',
]

AUTODISCOVER_HEALTHCHECKS = True

PING_JSON_KEYS = {

    'build_date_key': 'APP_BUILD_DATE',
    'commit_id_key': 'APP_GIT_COMMIT',
    'version_number_key': 'APP_VERSION',
    'build_tag_key': 'APP_BUILD_TAG',

}

# ENVIRON values

from django.core.exceptions import ImproperlyConfigured

# .env_values.py contains secrets and host config values usually stored
# in a different place
try:
    import env_values
except ImportError:
    env_values = None


def get_env_value(var_name):
    """ Get the env value `var_name` or return exception """
    try:
        return getattr(env_values, var_name)
    except AttributeError:
        raise ImproperlyConfigured("Environment value %s not found" % var_name)


DEBUG = True
TEMPLATE_DEBUG = DEBUG

DATABASES = {}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = []

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Europe/London'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-gb'

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = False

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = root('assets', 'uploads')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = root('static')

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# Currently GA
ANALYTICS_ID = os.environ.get('GA_ID', '')
ANALYTICS_DOMAIN = os.environ.get('GA_DOMAIN', '')

CSP_DEFAULT_SRC = (
    "'self'", "cdn.ravenjs.com", "app.getsentry.com", "ws:", "wss:",
    "www.google-analytics.com"
)

CSP_FONT_SRC = ("'self'", "data:", )

CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")

# Additional locations of static files
STATICFILES_DIRS = (
    root('assets'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '(W)*6GwxNiYn<B*ug<U9jdYNDY(#vu(:Y&NthqqPk?^CM=ee?z'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    ('pyjade.ext.django.Loader',(
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
    )),
)

MIDDLEWARE_CLASSES = (
    'django_statsd.middleware.GraphiteRequestTimingMiddleware',
    'django_statsd.middleware.GraphiteMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.session_security.middleware.SessionSecurityMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'cla_auth.middleware.ZoneMiddleware',
    'core.middleware.Cla401Middleware',
    'csp.middleware.CSPMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS =  (
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    'django.core.context_processors.request',
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "django.contrib.auth.context_processors.auth",
    "cla_frontend.apps.core.context_processors.globals",
)

ROOT_URLCONF = 'cla_frontend.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'cla_frontend.wsgi.application'

# TODO change this ?
#SESSION_ENGINE = 'django.contrib.sessions.backends.file'
SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
SESSION_COOKIE_SECURE = bool(os.environ.get('CLA_ENV'))

TEMPLATE_DIRS = (
    root('templates'),
)

INSTALLED_APPS = (
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'django_statsd',
    'widget_tweaks',
    'session_security',
    'raven.contrib.django.raven_compat',
)

PROJECT_APPS = (
    'cla_auth',
    'cla_common',
    'core',
    'legalaid',
    'call_centre',
    'cla_provider',
    'status'
)

INSTALLED_APPS += PROJECT_APPS

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
        'logstash': {
            '()': 'logstash_formatter.LogstashFormatter'
        }
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue'
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
            }
    }
}

BACKEND_BASE_URI = os.environ.get('BACKEND_BASE_URI', 'http://127.0.0.1:8000')

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
# LOGIN_REDIRECT_URL = 'cla_auth.views.login_redirect_url'

AUTH_USER_MODEL = 'cla_auth.ClaUser'
LOGIN_URL = 'auth:login'

# AUTHENTICATION_BACKENDS from ZONE_PROFILES
AUTHENTICATION_BACKENDS = [v['AUTHENTICATION_BACKEND'] for k,v in ZONE_PROFILES.items()]

# Settings for django-session-security.
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SECURITY_WARN_AFTER = 3360
SESSION_SECURITY_EXPIRE_AFTER = 3600

SESSION_SECURITY_PASSIVE_URLS = []
SESSION_SECURITY_PASSIVE_HEADER = 'HTTP__PASSIVE'
SESSION_SECURITY_PASSIVE_QUERYSTRING = '_passive'

RAVEN_CONFIG = {
    'dsn': os.environ.get('RAVEN_CONFIG_DSN', ''),
    'site': os.environ.get('RAVEN_CONFIG_SITE', '')
}

SOCKETIO_SERVER_URL = os.environ.get('SOCKETIO_SERVER_URL',
    'http://localhost:8005/socket.io')
SITE_HOSTNAME = os.environ.get('SITE_HOSTNAME', 'localhost')


# Zendesk feedback settings
ZENDESK_API_USERNAME = os.environ.get('ZENDESK_API_USERNAME', '')
ZENDESK_API_TOKEN = os.environ.get('ZENDESK_API_TOKEN', '')
ZENDESK_REQUESTER_ID = os.environ.get('ZENDESK_REQUESTER_ID', 762871298) # Defaults to 'Civil Legal Advice' user
ZENDESK_GROUP_ID = os.environ.get('ZENDESK_GROUP_ID', 24287107) # Defaults to 'CLA Operator/Provider' group
ZENDESK_API_ENDPOINT = 'https://ministryofjustice.zendesk.com/api/v2/'

if 'RAVEN_CONFIG_DSN' in os.environ:
    MIDDLEWARE_CLASSES = (
        'raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware',
        #'raven.contrib.django.raven_compat.middleware.Sentry404CatchMiddleware',
    ) + MIDDLEWARE_CLASSES


OS_PLACES_API_KEY = os.environ.get('OS_PLACES_API_KEY')

# importing test settings file if necessary (TODO chould be done better)
if len(sys.argv) > 1 and 'test' in sys.argv[1]:
    from .testing import *

# .local.py overrides all the common settings.
try:
    from .local import *
except ImportError:
    pass

STATSD_CLIENT = 'django_statsd.clients.normal'
STATSD_PREFIX = 'frontend'

STATSD_RECORD_KEYS = [
    'window.performance.timing.domComplete',
    'window.performance.timing.domInteractive',
    'window.performance.timing.domLoading',
    'window.performance.navigation.redirectCount',
    'window.performance.navigation.type',
]

STATSD_HOST = os.environ.get('STATSD_HOST', 'localhost')
STATSD_PORT = os.environ.get('STATSD_PORT', 8125)
