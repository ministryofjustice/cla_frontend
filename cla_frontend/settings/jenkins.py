from .testing import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ("Marco Fucci", "marco.fucci@digital.justice.co.uk"),
    ("Ravi Kotecha", "ravi.kotecha@digital.justice.gov.uk"),
)

MANAGERS = ADMINS

INSTALLED_APPS += ("django_jenkins",)

JENKINS_TASKS = ("django_jenkins.tasks.with_coverage",)

DATABASES = {}

# JENKINS_TEST_RUNNER = 'core.test_runners.AdvancedCITestSuiteRunner'

# HOST_NAME = ""

BACKEND_BASE_URI = "http://127.0.0.1:%s" % os.environ.get("CLA_BACKEND_PORT", 8000)

ZONE_PROFILES["call_centre"]["BASE_URI"] = "%s/call_centre/api/v1/" % BACKEND_BASE_URI
ZONE_PROFILES["cla_provider"]["BASE_URI"] = "%s/cla_provider/api/v1/" % BACKEND_BASE_URI
