from django.conf.urls import patterns, url
from cla_auth.views import logout_view

urlpatterns = patterns(
    "",
    url(r"^login/$", "cla_auth.views.login", name="login"),
    url(r"^entra-callback/$", "cla_auth.views.entra_callback", name="entra_callback"),
    url(r"^logout/$", logout_view, name="logout"),
    url(r"^entra-relogin/$", "cla_auth.views.entra_relogin", name="entra_relogin"),
)
