from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns("", url(r"^rota/$", views.rota, name="rota"))
