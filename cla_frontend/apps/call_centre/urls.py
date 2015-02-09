from django.conf.urls import patterns, url, include

from cla_auth import views as auth_views

from . import views


urlpatterns = patterns('',
    url(r'^admin/', include('call_centre.admin.urls', namespace='admin',)),

    url(r'^proxy/(?P<path>.*)', auth_views.backend_proxy_view, name="backend_proxy"),
    url(r'^.*$', views.dashboard, name='dashboard'),
)
