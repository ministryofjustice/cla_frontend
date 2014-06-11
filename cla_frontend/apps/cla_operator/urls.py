from django.conf.urls import patterns, url, include
from django.contrib.auth import views as django_views
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views

from . import views

#
urlpatterns = patterns('',
#     url(r'^login/$', auth_views.login, {
#         'zone_name': 'call_centre'
#     }, name='login'),
#
#     url(r'^logout/$', django_views.logout, {
#         'next_page': reverse_lazy('call_centre:login')
#     }, name='logout'),


    url(r'^case/(?P<case_reference>.+)/means_summary/$', views.case_means_summary),
    url(r'^.*$', views.dashboard, name='dashboard'),


    # url(r'^case/new/$', views.create_case, name='create_case'),
    # url(r'^case/(?P<case_reference>.+)/assign/$', views.assign_case, name='assign_case'),
    # url(r'^case/(?P<case_reference>.+)/assign/decline_all/$', views.decline_specialists, name='decline_specialists'),
    # url(r'^case/(?P<case_reference>.+)/assign/defer/$', views.defer_assignment, name='defer_assignment'),
    # url(r'^case/(?P<case_reference>.+)/close/$', views.close_case, name='close_case'),
    # url(r'^case/(?P<case_reference>.+)/edit/$', views.edit_case, name='edit_case'),
    # url(r'^case/(?P<case_reference>.+)/edit/personal_details/$', views.edit_case_personal_details, name='edit_case_personal_details'),
    #
    # url(r'^admin/', include('call_centre.admin.urls', namespace='admin',)),
    #
    # url(r'^proxy/(?P<path>.*)', views.backend_proxy_view, name="backend_proxy"),
)
