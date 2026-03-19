import json
import logging
import os
import msal
import base64

from django.http import HttpResponseRedirect
from django.contrib.auth import REDIRECT_FIELD_NAME, login as auth_login, authenticate
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.utils.http import is_safe_url
from django.shortcuts import resolve_url
from django.template.response import TemplateResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.conf import settings

from ipware.ip import get_ip
from proxy.views import proxy_view

from api.client import get_connection
from .forms import UsernameForm, PasswordForm
from .backend import get_backend
from .utils import user_has_entra_access

from . import get_zone

logger = logging.getLogger(__name__)

CONTENT_TYPE_JSON = "application/json"


class EntraAutView(object):
    @classmethod
    def build_msal_app(cls):
        return msal.ConfidentialClientApplication(
            settings.ENTRA_CLIENT_ID,
            authority=settings.ENTRA_AUTHORITY,
            client_credential=settings.ENTRA_CLIENT_SECRET,
        )

    @classmethod
    def build_entra_auth_url(cls, request, state):
        msal_app = cls.build_msal_app()
        kwargs = {
            "scopes": [settings.ENTRA_SCOPE],
            "redirect_uri": request.build_absolute_uri(settings.ENTRA_REDIRECT_PATH),
            "state": state,
        }
        return msal_app.get_authorization_request_url(**kwargs)

    @classmethod
    def route_login(cls, request):
        logout(request)
        return_to = request.GET.get(REDIRECT_FIELD_NAME)
        if return_to:
            request.session.update({REDIRECT_FIELD_NAME: return_to})
        state = base64.urlsafe_b64encode(os.urandom(32)).rstrip("=")
        request.session["oauth_state"] = state
        return redirect(cls.build_entra_auth_url(request, state))

    @classmethod
    def route_logout(self, request):
        logout(request)
        post_logout_uri = request.build_absolute_uri("/auth/login/")
        logout_url = "{}/oauth2/v2.0/logout?post_logout_redirect_uri={}".format(
            settings.ENTRA_AUTHORITY, post_logout_uri
        )
        response = redirect(logout_url)
        response = _clear_session_cookie(response)
        return response

    @classmethod
    def route_call_back(cls, request):
        code = request.GET.get("code")
        if not code:
            logger.error("Entra authentication - No code provided")
            return redirect("/")

        state = request.GET.get("state")
        if not state:
            logger.error("Entra authentication -No state provided")
            return redirect("/")

        if state != request.session.get("oauth_state"):
            logger.error("Entra authentication -State provided does not match session state")
            return redirect("/")

        msal_app = cls.build_msal_app()
        result = msal_app.acquire_token_by_authorization_code(
            code, scopes=[settings.ENTRA_SCOPE], redirect_uri=request.build_absolute_uri(settings.ENTRA_REDIRECT_PATH)
        )

        if "error" in result:
            logger.error("Entra authentication - Error: %s" % result["error"])
            return redirect("/")

        if not result:
            return redirect("/")

        user = authenticate(payload=result)
        if not user:
            logger.error("Entra authentication - No user found")
            return redirect("/")

        auth_login(request, user)
        request.session.update({"entra_access_token": result.get("access_token")})
        logger.info(
            "login succeeded",
            extra={
                "AUTH_METHOD": "ENTRA",
                "IP": get_ip(request),
                "USERNAME": request.POST.get("username"),
                "HTTP_REFERER": request.META.get("HTTP_REFERER"),
                "HTTP_USER_AGENT": request.META.get("HTTP_USER_AGENT"),
            },
        )
        ui = user.zone_to_ui()
        if not ui:
            raise ValueError("User does not have access to any ui.")

        return_to = request.session.get(REDIRECT_FIELD_NAME, None)
        if return_to:
            del request.session[REDIRECT_FIELD_NAME]
        else:
            return_to = "/call_centre" if ui[0] == "operator" else "/provider"

        return redirect(return_to)


@sensitive_post_parameters()
@csrf_protect
@never_cache
def login(request):
    template_name = "accounts/login.html"
    redirect_to = request.GET.get(REDIRECT_FIELD_NAME, "")
    is_json = CONTENT_TYPE_JSON in request.META.get("HTTP_ACCEPT", "")

    if is_json and request.method == "POST":
        return _handle_ajax_login(request)

    if request.method == "POST":
        if request.POST.get("step") == "password":
            return _handle_password_step(request, template_name, redirect_to)

        return _handle_username_step(request, template_name)

    return TemplateResponse(request, template_name, {"form": UsernameForm(), "step": "username"})


@never_cache
def logout_view(request):
    if not request.user.is_authenticated():
        return redirect("/auth/login/")
    if request.user.zone_name != "entra":
        return legacy_logout(request)
    return EntraAutView.route_logout(request)


def _clear_session_cookie(response):
    response["Set-Cookie"] = (
        os.environ.get("SESSION_COOKIE_NAME", "SID") + "=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0"
    )
    return response


# These handlers split the two_step_login view into smaller pieces, handling the AJAX login separately.
def _handle_ajax_login(request):
    form = PasswordForm(request, username=request.POST.get("username"), data=request.POST)
    if form.is_valid():
        auth_login(request, form.get_user())
        return HttpResponse(status=204)
    return HttpResponse(json.dumps(form.errors), status=400, content_type=CONTENT_TYPE_JSON)


def _handle_username_step(request, template_name):
    form = UsernameForm(request.POST)

    if not form.is_valid():
        return TemplateResponse(request, template_name, {"form": form, "step": "username"})

    username = form.cleaned_data["username"]

    if user_has_entra_access(username):
        return EntraAutView.route_login(request)

    return TemplateResponse(
        request,
        template_name,
        {"form": PasswordForm(request, username=username), "step": "password", "username": username},
    )


def _handle_password_step(request, template_name, redirect_to):
    username = request.POST.get("username")

    form = PasswordForm(request, username=username, data=request.POST)

    if not form.is_valid():
        return TemplateResponse(request, template_name, {"form": form, "step": "password", "username": username})

    auth_login(request, form.get_user())

    if not is_safe_url(url=redirect_to, host=request.get_host()):
        redirect_to = resolve_url(form.get_login_redirect_url())

    return HttpResponseRedirect(redirect_to)


# ==============================================================
# LEGACY VIEWS - to be removed once we have fully switched to Entra ID authentication
# ==============================================================
@csrf_exempt
def backend_proxy_view(request, path, use_auth_header=True, base_remote_url=None):
    """
    TODO: hacky as it's getting the base_url and the auth header from the
        get_connection slumber object.

        Also, we should limit the endpoint accessible from this proxy

    if you specifiy `use_auth_header` to be false, then it won't use the zone
    or url info from the get_connection slumber object. In that case you
    should pass in the base_remote_url yourself.
    """
    assert use_auth_header or base_remote_url
    if use_auth_header:
        client = get_connection(request)
        extra_requests_args = {
            "headers": {k.upper(): v for k, v in dict([client._store["session"].auth.get_header()]).items()}
        }
        if not base_remote_url:
            base_remote_url = client._store["base_url"]
    else:
        extra_requests_args = {}
    remoteurl = "%s%s" % (base_remote_url, path)
    return proxy_view(request, remoteurl, extra_requests_args)


def legacy_logout(request):
    """
    Handle user logout by revoking API token, clearing Django session, and deleting cookies.

    This view performs a complete logout process in three steps:
    1. Revokes the user's API token from the authentication backend
    2. Logs out the user from the Django session
    3. Deletes the HTTP-only session cookie

    Args:
        request: HttpRequest object containing user session and authentication data

    Returns:
        HttpResponse: A redirect response to the home page ("/") with the session
        cookie cleared by setting Max-Age=0

    Note:
        The session cookie is cleared using secure flags:
        - __Host- prefix for enhanced security
        - Secure flag (HTTPS only)
        - HttpOnly flag (no JavaScript access)
        - SameSite=Strict (CSRF protection)
    """

    # 1. Revoke API token
    token = request.user.pk
    zone = get_zone(request)

    backend = get_backend(zone["name"])
    backend.revoke_token(token)

    # 2. Logout Django session
    logout(request)

    # 3. Delete cookies
    response = redirect("/")
    response = _clear_session_cookie(response)

    return response
