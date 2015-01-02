from django.conf.urls import patterns, url
from django.contrib.auth import views as django_views
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views
from cla_provider import views as provider_views

from . import views

from django.conf import settings
zone = settings.ZONE_PROFILES.get('cla_provider')

urlpatterns = patterns('',
    url(r'^case/(?P<case_reference>.+)/legal_help_form/$',
        provider_views.legal_help_form,
        name='legal_help_form'
    ),
    url(r'^login/$', auth_views.login, {
        'zone_name': 'cla_provider'
    }, name='login'),

    url(r'^logout/$', django_views.logout, {
        'next_page': reverse_lazy('cla_provider:login')
    }, name='logout'),


    url(r'^proxy/caseExport/$', auth_views.backend_proxy_view,
        name="backend_proxy_provider_export",
        kwargs={
            'use_auth_header': False,
            'path': 'caseExport/',
            'base_remote_url': zone.get('BASE_URI')}),
    url(r'^proxy/(?P<path>.*)', auth_views.backend_proxy_view, name="backend_proxy"),
    url(r'^.*$', views.dashboard, name='dashboard'),
)
