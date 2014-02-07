from .views import CheckerWizard

def wizard_steps(request):
    """
    Returns a lazy 'messages' context variable.
    """
    return {'wizard_steps': [x[0] for x in CheckerWizard.form_list]}
