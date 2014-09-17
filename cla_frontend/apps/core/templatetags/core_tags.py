from django import template
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.conf import settings

register = template.Library()


@register.simple_tag
def staticmin(name):
    parts = name.split('.')
    if not settings.DEBUG:
        parts.insert(-1, 'min')
    return static('.'.join(parts))


@register.filter
def subtract(value, arg):
    return value - arg
