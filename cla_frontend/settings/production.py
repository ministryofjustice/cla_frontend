from .base import *


DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('MoJ', 'Your email'),
)

MANAGERS = ADMINS


DATABASES = { }

RAVEN_CONFIG = {
    'dsn': 'https://670814d125c247128021ab1c8174ec31:aa5d9a063b514194bb6f56eb34cbeef9@app.getsentry.com/26719',
}

# Add raven to the list of installed apps
INSTALLED_APPS = INSTALLED_APPS + (
    # ...
    'raven.contrib.django.raven_compat',
)
