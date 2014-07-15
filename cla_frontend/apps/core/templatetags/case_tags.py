from django import template

from cla_common.constants import REQUIRES_ACTION_BY

register = template.Library()


@register.filter()
def is_case_in_review(case):
    """
    TODO: might not be needed anymore in the future if we start using Angular
    in templates.
    """
    return case.get('requires_action_by') == REQUIRES_ACTION_BY.PROVIDER_REVIEW
