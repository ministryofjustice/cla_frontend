# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import http
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from . import base
from django.core.urlresolvers import reverse_lazy


@login_required
def test_view(request):
    return http.HttpResponse('logged in')


zone_url = patterns(
    '',
    url(
        r'^test/$',
        test_view,
        name=base.DEFAULT_ZONE_PROFILE['LOGIN_REDIRECT_URL'].split(':')[1]
    ),
)


global_urls = patterns(
    '',
    url(
        r'^logout/$', 'django.contrib.auth.views.logout',
        {'next_page': reverse_lazy('auth:login')},
        name='logout'
    ),
    url(r'^login/$', 'cla_auth.views.login', name='login'),
)


urlpatterns = patterns('',
    url(r'^test_zone/', include(zone_url, namespace=base.DEFAULT_ZONE_NAME)),
    url(r'^auth/', include(global_urls, namespace='auth')),
    url(r'session_security/', include('session_security.urls')),
)
