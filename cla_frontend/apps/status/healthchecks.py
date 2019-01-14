from moj_irat import healthchecks

from django.conf import settings

backend_healthcheck_uri = "%s/%s" % (settings.BACKEND_BASE_URI, "status/healthcheck.json")

backend_healthcheck = healthchecks.JsonUrlHealthcheck("Backend API test", backend_healthcheck_uri)
