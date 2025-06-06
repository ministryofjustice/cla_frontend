import sys
import os
from os.path import join, abspath, dirname

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

# PATH vars

here = lambda *x: join(abspath(dirname(__file__)), *x)
PROJECT_ROOT = here("..")
root = lambda *x: join(abspath(PROJECT_ROOT), *x)

APPS_ROOT = root("apps")

sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, APPS_ROOT)

HEALTHCHECKS = ["status.healthchecks.backend_healthcheck"]

AUTODISCOVER_HEALTHCHECKS = True

LOW_SAMPLE_RATE_TRANSACTIONS = [
    "/",
    "/status/ready",
    "/status/ready/",
    "/status/live",
    "/status/live/",
    "/auth/login",
    "/auth/login/",
    "/status/ping.json",
    "/status/status.json",
    "/status/healthcheck.json",
]

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


def sentry_traces_sampler(sampling_context):
    try:
        name = sampling_context["wsgi_environ"].get("PATH_INFO")
    except Exception:
        pass
    else:
        if name in LOW_SAMPLE_RATE_TRANSACTIONS:
            return 0.0001
    return 0.1


DEBUG = os.environ.get("DEBUG", "False") == "True"
TEMPLATE_DEBUG = DEBUG

DATABASES = {}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost").split(",")

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = "Europe/London"

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = "en-gb"

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
MEDIA_ROOT = root("assets", "uploads")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = "/media/"

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = root("static")

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = "/static/"

# Hostname and port to access the site locally (from the same container)
LOCAL_HOST = "http://localhost:8000"

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/
if os.environ.get("STATIC_FILES_BACKEND") == "s3":
    STATICFILES_STORAGE = "core.s3.StaticS3Storage"

AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "eu-west-1")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = False

# This bucket needs to a public bucket as it will serve public assets such as css,images and js
AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STATIC_FILES_STORAGE_BUCKET_NAME")

CSP_DEFAULT_SRC = [
    "'self'",
    "o345774.ingest.sentry.io",
    "*.googletagmanager.com",
    "www.google.co.uk",
    "*.analytics.google.com",
    "*.google-analytics.com",
    "ws:",
    "wss:",
    "*.doubleclick.net",
]
if "localhost" in ALLOWED_HOSTS:
    CSP_DEFAULT_SRC += "localhost:*"

CSP_FONT_SRC = ["'self'", "data:"]

CSP_STYLE_SRC = ["'self'", "'unsafe-inline'"]

if AWS_STORAGE_BUCKET_NAME:
    AWS_STORAGE_BUCKET_HOSTNAME = AWS_STORAGE_BUCKET_NAME + ".s3.amazonaws.com"
    CSP_DEFAULT_SRC.append(AWS_STORAGE_BUCKET_HOSTNAME)
    CSP_FONT_SRC.append(AWS_STORAGE_BUCKET_HOSTNAME)
    CSP_STYLE_SRC.append(AWS_STORAGE_BUCKET_HOSTNAME)

# Additional locations of static files
STATICFILES_DIRS = (root("assets"),)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)

SECRET_KEY = os.environ["SECRET_KEY"]

# Sets whether the updated family issue text displays on in scope family cases or not
FAMILY_ISSUE_FEATURE_FLAG = os.environ.get("FAMILY_ISSUE_FEATURE_FLAG", "False").lower() == "true"

# Sets whether the new notes format is displayed
NEW_CLIENT_NOTE_FEATURE_FLAG = os.environ.get("NEW_CLIENT_NOTE_FEATURE_FLAG", "False").lower() == "true"

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    (
        "pyjade.ext.django.Loader",
        ("django.template.loaders.filesystem.Loader", "django.template.loaders.app_directories.Loader"),
    ),
)

MIDDLEWARE_CLASSES = (
    "core.middleware.MaintenanceModeMiddleware",
    "django_statsd.middleware.GraphiteRequestTimingMiddleware",
    "django_statsd.middleware.GraphiteMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "core.session_security.middleware.SessionSecurityMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "cla_auth.middleware.ZoneMiddleware",
    "core.middleware.Cla401Middleware",
    "csp.middleware.CSPMiddleware",
    "django_cookies_samesite.middleware.CookiesSameSite",
    "djangosecure.middleware.SecurityMiddleware",
)

DISABLE_SAMESITE_MIDDLEWARE = os.environ.get("DISABLE_SAMESITE_MIDDLEWARE", "False") == "True"

if not DISABLE_SAMESITE_MIDDLEWARE:
    MIDDLEWARE_CLASSES = MIDDLEWARE_CLASSES + ("django_cookies_samesite.middleware.CookiesSameSite",)

ENABLE_NO_CACHE_MIDDLEWARE = os.environ.get("ENABLE_NO_CACHE_MIDDLEWARE", "False").lower() == "true"

if ENABLE_NO_CACHE_MIDDLEWARE:
    MIDDLEWARE_CLASSES = MIDDLEWARE_CLASSES + ("core.middleware.NoCacheMiddleware",)

# Security Settings
SECURE_CONTENT_TYPE_NOSNIFF = os.environ.get("SECURE_CONTENT_TYPE_NOSNIFF", "True") == "True"
CSRF_COOKIE_SECURE = os.environ.get("CSRF_COOKIE_SECURE", "True") == "True"
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "True") == "True"
SESSION_COOKIE_HTTPONLY = os.environ.get("SESSION_COOKIE_HTTPONLY", "True") == "True"

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.request",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "django.contrib.auth.context_processors.auth",
    "cla_frontend.apps.core.context_processors.globals",
)

ROOT_URLCONF = "cla_frontend.urls"

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = "cla_frontend.wsgi.application"

# TODO change this ?
# SESSION_ENGINE = 'django.contrib.sessions.backends.file'
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "True") == "True"

TEMPLATE_DIRS = (root("templates"),)

INSTALLED_APPS = (
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "django_statsd",
    "widget_tweaks",
    "session_security",
    "djangosecure",
)

PROJECT_APPS = ("cla_auth", "cla_common", "core", "legalaid", "call_centre", "cla_provider", "status")

INSTALLED_APPS += PROJECT_APPS

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s"},
        "simple": {"format": "%(levelname)s %(message)s"},
        "logstash": {"()": "logstash_formatter.LogstashFormatter"},
    },
    "handlers": {
        "console": {"level": "INFO", "class": "logging.StreamHandler", "formatter": "simple", "stream": sys.stdout}
    },
    "loggers": {
        "": {"handlers": ["console"], "level": "INFO", "propagate": True},
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
    },
}

BACKEND_BASE_URI = os.environ.get("BACKEND_BASE_URI", "http://127.0.0.1:8000")
if "CLA_PROVIDER_SECRET_ID" in os.environ:
    provider_client_secret = os.environ.get("CLA_PROVIDER_SECRET_ID")
else:
    # Remove after deployment is migrated to kubernetes
    provider_client_secret = os.environ.get("CALL_PROVIDER_SECRET_ID", "0494287c65bdf61d29f0eeed467ec8e090f0d80f")

ZONE_PROFILES = {
    "call_centre": {
        "CLIENT_ID": os.environ.get("CALL_CENTRE_CLIENT_ID", "b4b9220ffcb11ebfdab1"),
        "CLIENT_SECRET": os.environ.get("CALL_CENTRE_SECRET_ID", "2df71313bdd38a2e1b815015e1b14387e7681d41"),
        "LOGIN_REDIRECT_URL": "call_centre:dashboard",
        "BASE_URI": "%s/call_centre/api/v1/" % BACKEND_BASE_URI,
        "AUTHENTICATION_BACKEND": "call_centre.backend.CallCentreBackend",
    },
    "cla_provider": {
        "CLIENT_ID": os.environ.get("CLA_PROVIDER_CLIENT_ID", "59657ed22d980251cdd3"),
        "CLIENT_SECRET": provider_client_secret,
        "LOGIN_REDIRECT_URL": "cla_provider:dashboard",
        "BASE_URI": "%s/cla_provider/api/v1/" % BACKEND_BASE_URI,
        "AUTHENTICATION_BACKEND": "cla_provider.backend.ClaProviderBackend",
    },
}
# LOGIN_REDIRECT_URL = 'cla_auth.views.login_redirect_url'

AUTH_USER_MODEL = "cla_auth.ClaUser"
LOGIN_URL = "auth:login"

# AUTHENTICATION_BACKENDS from ZONE_PROFILES
AUTHENTICATION_BACKENDS = [v["AUTHENTICATION_BACKEND"] for k, v in ZONE_PROFILES.items()]

# Settings for django-session-security.
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SECURITY_WARN_AFTER = 3360
SESSION_SECURITY_EXPIRE_AFTER = 3600

SESSION_SECURITY_PASSIVE_URLS = []
SESSION_SECURITY_PASSIVE_HEADER = "HTTP__PASSIVE"
SESSION_SECURITY_PASSIVE_QUERYSTRING = "_passive"

if "SENTRY_PUBLIC_DSN" in os.environ:
    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_PUBLIC_DSN"),
        integrations=[DjangoIntegration()],
        traces_sampler=sentry_traces_sampler,
        environment=os.environ.get("CLA_ENV", "unknown"),
    )
SENTRY_PUBLIC_DSN = os.environ.get("SENTRY_PUBLIC_DSN", "")
SITE_HOSTNAME = os.environ.get("SITE_HOSTNAME", "localhost")
# socket.io accessible over the internet, ie for browsers
SOCKETIO_SERVER_URL = os.environ.get("SOCKETIO_SERVER_URL", "http://localhost:8005/socket.io")
# socket.io accessible within the cluster, for health checks
SOCKETIO_SERVICE_URL = os.environ.get("SOCKETIO_SERVICE_URL", "localhost:8005/socket.io/")


# Zendesk feedback settings
ZENDESK_API_USERNAME = os.environ.get("ZENDESK_API_USERNAME", "")
ZENDESK_API_TOKEN = os.environ.get("ZENDESK_API_TOKEN", "")
ZENDESK_REQUESTER_ID = os.environ.get("ZENDESK_REQUESTER_ID", 762871298)  # Defaults to 'Civil Legal Advice' user
ZENDESK_GROUP_ID = os.environ.get("ZENDESK_GROUP_ID", 24287107)  # Defaults to 'CLA Operator/Provider' group
ZENDESK_API_ENDPOINT = "https://ministryofjustice.zendesk.com/api/v2/"


OS_PLACES_API_KEY = os.environ.get("OS_PLACES_API_KEY")

# importing test settings file if necessary (TODO chould be done better)
if len(sys.argv) > 1 and "test" in sys.argv[1]:
    from .testing import *

# .local.py overrides all the common settings.
try:
    from .local import *
except ImportError:
    pass

STATSD_CLIENT = "django_statsd.clients.normal"
STATSD_PREFIX = "frontend"

STATSD_RECORD_KEYS = [
    "window.performance.timing.domComplete",
    "window.performance.timing.domInteractive",
    "window.performance.timing.domLoading",
    "window.performance.navigation.redirectCount",
    "window.performance.navigation.type",
]

MAINTENANCE_MODE = os.environ.get("MAINTENANCE_MODE", "False") == "True"
