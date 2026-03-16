import json
import logging
import os
import msal

from django.http import HttpResponseRedirect
from django.contrib.auth import REDIRECT_FIELD_NAME, login as auth_login, authenticate
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.utils.http import is_safe_url
from django.shortcuts import resolve_url
from django.contrib.sites.models import get_current_site
from django.template.response import TemplateResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.conf import settings

from django_statsd.clients import statsd
from ipware.ip import get_ip
from proxy.views import proxy_view

from api.client import get_connection
from .forms import AuthenticationForm, UsernameForm, PasswordForm
from .backend import get_backend
from .utils import user_has_entra_access

from . import get_zone

logger = logging.getLogger(__name__)

CONTENT_TYPE_JSON = "application/json"


def _build_msal_app():
    return msal.ConfidentialClientApplication(
        settings.ENTRA_CLIENT_ID, authority=settings.ENTRA_AUTHORITY, client_credential=settings.ENTRA_CLIENT_SECRET
    )


def login(request):
    return two_step_login(request)


def logout_view(request):
    if not request.user.is_authenticated():
        return redirect("/auth/login/")
    if request.user.zone_name != "entra":
        return legacy_logout(request)
    return entra_logout(request)


def _clear_session_cookie(response):
    response["Set-Cookie"] = (
        os.environ.get("SESSION_COOKIE_NAME", "SID") + "=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0"
    )
    return response


# ==============================================================
# Entra ID Authentication Views
# ==============================================================
def _get_entra_auth_url(request, prompt=None):
    msal_app = _build_msal_app()
    kwargs = {
        "scopes": [settings.ENTRA_SCOPE],
        "redirect_uri": request.build_absolute_uri(settings.ENTRA_REDIRECT_PATH),
    }
    if prompt:
        kwargs["prompt"] = prompt
    return msal_app.get_authorization_request_url(**kwargs)


def _get_logout_url(request):
    post_logout_uri = request.build_absolute_uri("/auth/login/")
    return "{}/oauth2/v2.0/logout?post_logout_redirect_uri={}".format(settings.ENTRA_AUTHORITY, post_logout_uri)


@never_cache
def entra_login(request):
    return redirect(_get_entra_auth_url(request))


@never_cache
def entra_relogin(request):
    logout(request)
    response = redirect(_get_entra_auth_url(request, prompt="login"))
    response = _clear_session_cookie(response)
    return response


@never_cache
def entra_callback(request):
    code = request.GET.get("code")
    if not code:
        logger.error("Entra authentication - No code provided")
        return redirect("/")

    msal_app = _build_msal_app()
    result = msal_app.acquire_token_by_authorization_code(
        code, scopes=[settings.ENTRA_SCOPE], redirect_uri=request.build_absolute_uri(settings.ENTRA_REDIRECT_PATH)
    )
    if "error" in result:
        logger.error("Entra authentication - Error: %s" % result["error"])
        return redirect("/")
    user = authenticate(token=result)

    auth_login(request, user)

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

    path = "/call_centre" if ui[0] == "operator" else "/provider"
    return redirect(path)


def entra_logout(request):
    logout(request)
    response = redirect(_get_logout_url(request))
    response = _clear_session_cookie(response)
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
        return TemplateResponse(request, template_name, {"form": form})
    username = form.cleaned_data["username"]
    if user_has_entra_access(username):
        return entra_login(request)
    request.session["login_username"] = username
    return TemplateResponse(request, template_name, {"form": PasswordForm(), "show_back": True})


def _handle_password_step(request, template_name, redirect_to):
    form = PasswordForm(request, username=request.session["login_username"], data=request.POST)
    if not form.is_valid():
        return TemplateResponse(request, template_name, {"form": form, "show_back": True})
    request.session.pop("login_username")
    auth_login(request, form.get_user())
    if not is_safe_url(url=redirect_to, host=request.get_host()):
        redirect_to = resolve_url(form.get_login_redirect_url())
    return HttpResponseRedirect(redirect_to)


@sensitive_post_parameters()
@csrf_protect
@never_cache
def two_step_login(request, template_name="accounts/login.html"):
    """
    Split into two steps: username first, then password (or Entra redirect).
    """
    is_json = CONTENT_TYPE_JSON in request.META.get("HTTP_ACCEPT", "")
    redirect_to = request.GET.get(REDIRECT_FIELD_NAME, "")

    if is_json and request.method == "POST":
        return _handle_ajax_login(request)

    if request.GET.get("clear"):
        request.session.pop("login_username", None)
        return TemplateResponse(request, template_name, {"form": UsernameForm()})

    if request.method == "POST":
        if "password" in request.POST and "login_username" in request.session:
            return _handle_password_step(request, template_name, redirect_to)
        return _handle_username_step(request, template_name)

    return TemplateResponse(request, template_name, {"form": UsernameForm()})


# ==============================================================
# LEGACY VIEWS - to be removed once we have fully switched to Entra ID authentication
# ==============================================================
@sensitive_post_parameters()
@csrf_protect
@never_cache
def legacy_login(
    request,
    template_name="accounts/login.html",
    redirect_field_name=REDIRECT_FIELD_NAME,
    authentication_form=AuthenticationForm,
    current_app=None,
    extra_context=None,
):
    """
    Displays the login form and handles the login action.
    """
    is_json = CONTENT_TYPE_JSON in request.META.get("HTTP_ACCEPT", "")
    redirect_to = request.GET.get(redirect_field_name, "")

    if request.method == "POST":
        form = authentication_form(request, data=request.POST)
        if form.is_valid():
            # Ensure the user-originating redirection url is safe.
            if not is_safe_url(url=redirect_to, host=request.get_host()):
                redirect_to = resolve_url(form.get_login_redirect_url())

            # Okay, security check complete. Log the user in.
            auth_login(request, form.get_user())

            statsd.incr("login.success")

            logger.info(
                "login succeeded",
                extra={
                    "IP": get_ip(request),
                    "USERNAME": request.POST.get("username"),
                    "HTTP_REFERER": request.META.get("HTTP_REFERER"),
                    "HTTP_USER_AGENT": request.META.get("HTTP_USER_AGENT"),
                },
            )

            if is_json:
                return HttpResponse(status=204)
            return HttpResponseRedirect(redirect_to)
        else:
            statsd.incr("login.failed")

            logger.info(
                "login failed",
                extra={
                    "IP": get_ip(request),
                    "USERNAME": request.POST.get("username"),
                    "HTTP_REFERER": request.META.get("HTTP_REFERER"),
                    "HTTP_USER_AGENT": request.META.get("HTTP_USER_AGENT"),
                },
            )

            if is_json:
                return HttpResponse(json.dumps(form.errors), status=400, content_type=CONTENT_TYPE_JSON)
    else:
        form = authentication_form(request)

    current_site = get_current_site(request)

    context = {"form": form, redirect_field_name: redirect_to, "site": current_site, "site_name": current_site.name}
    if extra_context is not None:
        context.update(extra_context)

    return TemplateResponse(request, template_name, context, current_app=current_app)


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
