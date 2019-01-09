import json
import logging

from django.http import HttpResponseRedirect
from django.contrib.auth import REDIRECT_FIELD_NAME, login as auth_login
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.utils.http import is_safe_url
from django.shortcuts import resolve_url
from django.contrib.sites.models import get_current_site
from django.template.response import TemplateResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

from django_statsd.clients import statsd
from ipware.ip import get_ip

from proxy.views import proxy_view

from api.client import get_connection

from .forms import AuthenticationForm


logger = logging.getLogger(__name__)


@sensitive_post_parameters()
@csrf_protect
@never_cache
def login(
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
    is_json = "application/json" in request.META.get("HTTP_ACCEPT", "")
    redirect_to = request.REQUEST.get(redirect_field_name, "")

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
                return HttpResponse(json.dumps(form.errors), status=400, content_type="application/json")
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
    remoteurl = u"%s%s" % (base_remote_url, path)
    return proxy_view(request, remoteurl, extra_requests_args)
