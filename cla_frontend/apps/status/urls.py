from django.conf.urls import patterns, url

from django.conf import settings

from . import views

from moj_irat.views import PingJsonView

urlpatterns = patterns(
    '',
    url(r'^$', views.status, name='status'),
    url(r'^status.json$', views.smoketests_json),
    url(r'^ping.json$', PingJsonView.as_view(**settings.PING_JSON_KEYS), name='ping_json'),
    url(r'^healthcheck.json$', views.healthcheck_json),
)
