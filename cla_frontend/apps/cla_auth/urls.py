from django.conf.urls import patterns, url
from cla_auth.views import logout_view

urlpatterns = patterns(
    "",
    url(r"^login/$", "cla_auth.views.login", name="login"),
    url(r"^logout/$", logout_view, name="logout"),
)
