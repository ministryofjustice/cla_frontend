from django.conf.urls import patterns, url

from .views import JsonPingView

urlpatterns = patterns('',
   url(
       'ping/$',
       JsonPingView.as_view(),
       name='session_security_ping',
       ),
   )
