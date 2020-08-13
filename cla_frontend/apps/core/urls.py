from django.conf.urls import patterns, url
from .views import MaintenanceModeView

urlpatterns = patterns("", url(r"^maintenance$", view=MaintenanceModeView.as_view(), name="maintenance_page"))
