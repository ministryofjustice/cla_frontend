from django.conf.urls import patterns, url
from cla_auth.views import logout_view
from cla_auth.views import EntraAuthView

urlpatterns = patterns(
    "",
    url(r"^login/$", "cla_auth.views.login", name="login"),
    url(r"^entra-login/$", EntraAuthView.route_login, name="entra_callback"),
    url(r"^entra-callback/$", EntraAuthView.route_call_back, name="entra_callback"),
    url(r"^logout/$", logout_view, name="logout"),
)
