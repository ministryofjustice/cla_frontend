from django.conf.urls import patterns, url
from moj_irat.views import HealthcheckView
from . import views


urlpatterns = patterns(
    "",
    url(r"^$", views.status, name="status"),
    url(r"^status.json$", views.smoketests_json),
    url(r"^ping.json$", views.PingJsonView.as_view(), name="ping_json"),
    url(r"^healthcheck.json$", HealthcheckView.as_view(), name="healthcheck_json"),
)
