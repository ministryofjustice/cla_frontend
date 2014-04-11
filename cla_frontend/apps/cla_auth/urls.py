from django.conf.urls import patterns, url
from django.core.urlresolvers import reverse_lazy
from django.views.generic.base import TemplateView


urlpatterns = patterns('',
    url(r'^login/$', TemplateView.as_view(template_name='accounts/global_login.html'), {
    }, name='global_login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout',
        {'next_page': reverse_lazy('auth:global_login')},
        name='global_logout'),
)
