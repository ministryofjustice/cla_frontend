from .base import *

import sys
from os.path import join, abspath, dirname


sys.path.insert(0, root("apps"))

TEST_RUNNER = "core.testing.runner.NoDbTestRunner"

OS_PLACES_API_KEY = "DUMMY_KEY"
