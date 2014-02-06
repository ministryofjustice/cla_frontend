from .base import *


ADMINS = (
    ('MoJ', 'Your email'),
)

MANAGERS = ADMINS

DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #     'NAME': 'cla_frontend',
    #     'USER': 'postgres',
    #     'PASSWORD': '',
    #     'HOST': 'localhost',
    #     'PORT': '',
    # }
}


# You might want to use sqlite3 for testing in local as it's much faster.
# if len(sys.argv) > 1 and 'test' in sys.argv[1]:
#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.sqlite3',
#             'NAME': '/tmp/cla_frontend_test.db',
#             'USER': '',
#             'PASSWORD': '',
#             'HOST': '',
#             'PORT': '',
#         }
#     }
