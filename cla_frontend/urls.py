# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

urlpatterns = patterns('',
    url(r'^accounts/', include('cla_auth.urls', namespace='account',)),
    url(r'^call_centre/', include('call_centre.urls', namespace='call_centre',)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
