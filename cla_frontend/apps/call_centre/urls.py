from django.conf.urls import patterns, url
from django.contrib.auth import views as django_views
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views

from . import views


urlpatterns = patterns('',
    url(r'^login/$', auth_views.login, {
        'zone_name': 'call_centre'
    }, name='login'),

    url(r'^logout/$', django_views.logout, {
        'next_page': reverse_lazy('call_centre:login')
    }, name='logout'),


    url(r'^$', views.dashboard, name='dashboard'),
    url(r'^case/edit/$', views.create_case, name='create_case'),
    url(r'^case/(?P<case_ref>.+)/edit/$', views.edit_case, name='edit_case'),
)
