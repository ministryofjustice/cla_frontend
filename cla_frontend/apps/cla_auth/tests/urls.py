# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import http
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from . import base


@login_required
def test_view(request):
    return http.HttpResponse('logged in')


zone_url = patterns('',
    url(r'^login/$', 'cla_auth.views.login', {
        'zone_name': base.DEFAULT_ZONE_NAME
    }, name='login'),
    url(r'^test/$',
        test_view,
        name=base.DEFAULT_ZONE_PROFILE['LOGIN_REDIRECT_URL'].split(':')[1]
    )
)


urlpatterns = patterns('',
    url(r'^test_zone/', include(zone_url, namespace=base.DEFAULT_ZONE_NAME)),
)
