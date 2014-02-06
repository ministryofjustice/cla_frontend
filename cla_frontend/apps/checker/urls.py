from django.conf.urls import patterns, url

from . import views


checker_wizard = views.CheckerWizard.as_view(
    url_name='checker:checker_step'
)

urlpatterns = patterns('',
    url(r'^result/$', views.ResultView.as_view(), name='result'),

    url(r'^$', checker_wizard, name='checker'),
    url(r'^(?P<step>.+)/$', checker_wizard, name='checker_step'),

)
