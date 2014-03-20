from django.conf.urls import patterns, url
from django.contrib.auth import views
from django.core.urlresolvers import reverse_lazy

from .forms import AuthenticationForm


urlpatterns = patterns('',
    url(r'^login/$', views.login, {
        'authentication_form': AuthenticationForm,
        'template_name': 'accounts/login.html'
    }, name='login'),

    url(r'^logout/$', views.logout, {
        'next_page': reverse_lazy('account:login')
    }, name='logout'),
)
