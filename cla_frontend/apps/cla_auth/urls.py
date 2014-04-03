from django.conf.urls import patterns, url
from django.views.generic.base import TemplateView


urlpatterns = patterns('',
    url(r'^login/$', TemplateView.as_view(template_name='accounts/global_login.html'), {
    }, name='global_login'),
)
