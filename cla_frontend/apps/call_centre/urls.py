from django.conf.urls import patterns, url
from django.contrib.auth import views as django_views
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views

from . import views


urlpatterns = patterns('',
    url(r'^login/$', auth_views.login, {
        'auth_app': 'call_centre'
    }, name='login'),

    url(r'^logout/$', django_views.logout, {
        'next_page': reverse_lazy('call_centre:login')
    }, name='logout'),


    url(r'^$', views.dashboard, name='dashboard'),
)
