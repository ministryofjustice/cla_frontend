# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

urlpatterns = patterns(
    "",
    url(r"^call_centre/", include("call_centre.urls", namespace="call_centre")),
    url(r"^provider/", include("cla_provider.urls", namespace="cla_provider")),
    url(r"^auth/", include("cla_auth.urls", namespace="auth")),
    url(r"^session_security/", include("core.session_security.urls")),
    url(r"^services/timing/", include("django_statsd.urls")),
    url(r"^status/", include("status.urls")),
    url(r"^", include("legalaid.urls", namespace="legalaid")),
    url(r"^", include("core.urls", namespace="cla_backend_core")),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
