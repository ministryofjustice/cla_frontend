from django.conf.urls import patterns, url
from django.contrib.auth import views as django_views
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views
from cla_auth.utils import zone_required

from legalaid import views as legalaid_views

from . import views


urlpatterns = patterns('',
    url(r'^case/(?P<case_reference>.+)/means_summary/$', 
        zone_required(legalaid_views.case_means_summary, zone='cla_provider')
    ),
    url(r'^login/$', auth_views.login, {
        'zone_name': 'cla_provider'
    }, name='login'),

    url(r'^logout/$', django_views.logout, {
        'next_page': reverse_lazy('cla_provider:login')
    }, name='logout'),


    url(r'^proxy/(?P<path>.*)', auth_views.backend_proxy_view, name="backend_proxy"),
    url(r'^.*$', views.dashboard, name='dashboard'),

    # TODO: to be removed
    url(r'^case/(?P<case_reference>.+)/edit/$', views.edit_case, name='edit_case'),
    url(r'^case/(?P<case_reference>.+)/accept/$', views.accept_case, name='accept_case'),
    url(r'^case/(?P<case_reference>.+)/reject/$', views.reject_case, name='reject_case'),
    url(r'^case/(?P<case_reference>.+)/close/$', views.close_case, name='close_case'),
)
