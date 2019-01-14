from django.conf.urls import patterns, url, include
from django.views.generic import RedirectView
from django.core.urlresolvers import reverse_lazy

from cla_auth import views as auth_views
from cla_auth.utils import call_centre_zone_required
from zendesk.views import ZendeskView

from . import views


urlpatterns = patterns(
    "",
    url(r"^login/$", RedirectView.as_view(url=reverse_lazy("auth:login")), name="login"),
    url(r"^admin/", include("call_centre.admin.urls", namespace="admin")),
    url(r"^zendesk/$", call_centre_zone_required(ZendeskView.as_view()), name="zendesk"),
    url(r"^proxy/(?P<path>.*)", auth_views.backend_proxy_view, name="backend_proxy"),
    url(r"^.*$", views.dashboard, name="dashboard"),
)
