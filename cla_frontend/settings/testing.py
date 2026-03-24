from .base import *  # noqa: F403, F401

import sys


sys.path.insert(0, root("apps"))  # noqa: F405

TEST_RUNNER = "core.testing.runner.NoDbTestRunner"

OS_PLACES_API_KEY = "DUMMY_KEY"
