from django.conf.urls import patterns, url
from .views import MaintenanceModeView, FeatureFlagView

urlpatterns = patterns("", url(r"^feature-flags/$", view=FeatureFlagView.as_view(), name="feature_flags"), url(r"^maintenance$", view=MaintenanceModeView.as_view(), name="maintenance_page"))
