from django import template

from cla_common.constants import CASE_STATE_OPEN

register = template.Library()


@register.filter()
def is_case_open(case):
    """
    TODO: might not be needed anymore in the future if we start using Models
    in templates.
    """
    return case.get('state') == CASE_STATE_OPEN
