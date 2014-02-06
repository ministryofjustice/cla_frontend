from .base import *


DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('MoJ', 'Your email'),
)

MANAGERS = ADMINS


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'cla_frontend',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}