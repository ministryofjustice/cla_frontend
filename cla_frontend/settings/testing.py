from .base import *  # noqa: F403, F401

import sys


sys.path.insert(0, root("apps"))  # noqa: F405

TEST_RUNNER = "core.testing.runner.NoDbTestRunner"

OS_PLACES_API_KEY = "DUMMY_KEY"

# Tests should not depend on external Redis availability/URL.
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
