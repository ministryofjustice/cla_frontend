import logging

from django import forms
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

logger = logging.getLogger(__name__)

from . import authenticate
from .utils import get_zone_profile, get_available_zone_names

AUTOCOMPLETE_OFF_ATTRS = {"autocomplete": "off", "readonly": True, "class": "js-remove-readonly-onfocus"}


class UsernameForm(forms.Form):
    username = forms.CharField(
        label=_("Username"), max_length=254, widget=forms.TextInput(attrs=AUTOCOMPLETE_OFF_ATTRS)
    )


class PasswordForm(forms.Form):
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput(attrs=AUTOCOMPLETE_OFF_ATTRS))

    def __init__(self, request=None, username=None, *args, **kwargs):
        self.request = request
        self.username = username
        self.user_cache = None
        self.current_zone_name = None
        self.zone_names = kwargs.pop("zone_names", get_available_zone_names())
        super(PasswordForm, self).__init__(*args, **kwargs)

    def clean(self):
        password = self.cleaned_data.get("password")
        if self.username and password:
            for zone_name in self.zone_names:
                user = authenticate(zone_name, username=self.username, password=password)
                if user:
                    self.user_cache = user
                    self.current_zone_name = zone_name
                    break
            if self.user_cache is None:
                logger.warning("Failed login attempt for username=%s", self.username)
                raise forms.ValidationError(
                    "Please enter a correct username and password. " "Note that both fields may be case-sensitive.",
                    code="invalid_login",
                )
            if self.user_cache.is_locked_out:
                raise forms.ValidationError(
                    "Account locked: too many login attempts. Please try again later or contact your Manager.",
                    code="locked_out",
                )
            if not self.user_cache.is_active:
                raise forms.ValidationError(
                    "Account disabled, please contact your supervisor.", code="account_disabled"
                )
        return self.cleaned_data

    def get_user(self):
        return self.user_cache

    def get_login_redirect_url(self):
        zone_profile = get_zone_profile(self.current_zone_name)
        if not zone_profile:
            return None
        return reverse(zone_profile["LOGIN_REDIRECT_URL"])
