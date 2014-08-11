from django.conf.urls import patterns, url, include
from django.contrib.auth import views as django_views
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views
from cla_auth.utils import zone_required

from legalaid import views as legalaid_views

from . import views


urlpatterns = patterns('',
    url(r'^case/(?P<case_reference>.+)/means_summary/$', 
        zone_required(legalaid_views.case_means_summary, zone='call_centre')
    ),
    url(r'^login/$', auth_views.login, {
        'zone_name': 'call_centre'
    }, name='login'),

    url(r'^logout/$', django_views.logout, {
        'next_page': reverse_lazy('call_centre:login')
    }, name='logout'),

    url(r'^admin/', include('call_centre.admin.urls', namespace='admin',)),

    url(r'^proxy/(?P<path>.*)', auth_views.backend_proxy_view, name="backend_proxy"),
    url(r'^.*$', views.dashboard, name='dashboard'),
)
