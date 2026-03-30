from django.shortcuts import redirect
from django.conf import settings


def home(request):
    """
    Redirects to LOGIN if the user is not logged in, otherwise, it redirects
    to the appropriate dashboard page
    """
    if not request.user.is_authenticated():
        return redirect(settings.LOGIN_URL)

    ui = request.user.zone_to_ui()
    if not ui:
        raise ValueError("User does not have access to any ui.")
    return_to = "/call_centre" if ui[0] == "operator" else "/provider"
    return redirect(return_to)
