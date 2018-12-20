from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns(
    '',
    url(r'^addressfinder/(?P<path>.*)', views.postcode_lookup,
        name="addressfinder_proxy"),
    url(r'^$', views.home, name='home'),
)
