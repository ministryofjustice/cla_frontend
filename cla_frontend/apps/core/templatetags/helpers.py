from django import template
from django.template.defaultfilters import stringfilter

from numbers import Number
from dateutil import parser

register = template.Library()


@stringfilter
def unslug(name):
    return name.replace('_', ' ').capitalize()

register.filter('unslug', unslug)

@register.filter()
def as_date(date_string):
    try:
        return parser.parse(date_string, dayfirst=True)
    except:
        return None

@register.filter(is_safe=True)
def in_pounds(value):
    if isinstance(value, Number):
        value = value / 100.0
        return u'{val:.2f}'.format(val=value)
    return value
