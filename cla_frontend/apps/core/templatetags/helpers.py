from django import template
from django.template.defaultfilters import stringfilter


register = template.Library()

@stringfilter
def unslug(name):
    return name.replace('_', ' ').capitalize()

register.filter('unslug', unslug)