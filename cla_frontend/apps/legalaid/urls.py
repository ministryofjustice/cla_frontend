from django.conf.urls import patterns, url

from . import views
from postcode_lookup_views import postcode_lookup


urlpatterns = patterns(
    '',
    url(r'^addressfinder/(?P<path>.*)', postcode_lookup,
        name="addressfinder_proxy"),
    url(r'^$', views.home, name='home'),
)
