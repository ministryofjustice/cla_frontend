def globals(request):
  context = {
    'app_title': 'Civil Legal Advice',
    'proposition_title': 'Civil Legal Advice Tool',
    'phase': 'alpha',
    'product_type': 'service',
    'feedback_url': '#',
    'ga_id': '',
  }

  if hasattr(request, 'zone') and request.zone:
    context['app_base_template'] = '%s/base.html' % request.zone['name']
    context['zone'] = request.zone

  return context
