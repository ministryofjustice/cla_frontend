from django import template
from django.templatetags.static import static
from django.conf import settings

register = template.Library()


@register.simple_tag
def staticmin(name):
    parts = name.split('.')
    if not settings.DEBUG:
        parts.insert(-1, 'min')
    return static('.'.join(parts))
