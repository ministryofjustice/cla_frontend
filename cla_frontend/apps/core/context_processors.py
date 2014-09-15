from django.conf import settings

def globals(request):
  context = {
    'app_title': 'Civil Legal Advice',
    'proposition_title': 'Civil Legal Advice',
    'phase': 'alpha',
    'product_type': 'service',
    'feedback_url': '#',
    'ga_id': '',
    'raven_config_site': settings.RAVEN_CONFIG['site'] or ''
  }

  if hasattr(request, 'zone') and request.zone:
    context['app_base_template'] = '%s/base.html' % request.zone['name']
    context['zone'] = request.zone

  return context
