from .settings import *

import sys
from os.path import join, abspath, dirname

# here = lambda *x: join(abspath(dirname(__file__)), *x)
# PROJECT_ROOT = here("..")
# root = lambda *x: join(abspath(PROJECT_ROOT), *x)
# sys.path.insert(0, root('cla_frontend/apps/..'))
# sys.path.insert(0, root('cla_frontend/apps'))

TEST_RUNNER = 'core.testing.runner.NoDbTestRunner'

