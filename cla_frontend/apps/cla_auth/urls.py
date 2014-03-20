from django.conf.urls import patterns, url
from django.contrib.auth import views

from .forms import AuthenticationForm


urlpatterns = patterns('',
    url(r'^login/$', views.login, {
        'authentication_form': AuthenticationForm,
        'template_name': 'accounts/login.html'
    }, name='login'),
)
