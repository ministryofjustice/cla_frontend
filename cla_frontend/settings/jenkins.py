from .testing import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Marco Fucci', 'marco.fucci@digital.justice.co.uk'),
    ('Ravi Kotecha', 'ravi.kotecha@digital.justice.gov.uk'),
)

MANAGERS = ADMINS

INSTALLED_APPS += ('django_jenkins',)

JENKINS_TASKS = (
    'django_jenkins.tasks.with_coverage',
)

DATABASES = {}

#JENKINS_TEST_RUNNER = 'core.test_runners.AdvancedCITestSuiteRunner'

#HOST_NAME = ""

BACKEND_BASE_URI = 'http://127.0.0.1:%s' % os.environ.get("BACKEND_BASE_PORT", 8000)
