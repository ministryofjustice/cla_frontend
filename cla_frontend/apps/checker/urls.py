from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns('',
    url(r'^(?P<category>[\w-]*)/your-problem/$', views.YourDetailsView.as_view(), name='your_problem'),
    url(r'^your-finances/$', views.YourFinancesView.as_view(), name='your_finances'),
    url(r'^$', views.YourProblemView.as_view(), name='home'),
)
