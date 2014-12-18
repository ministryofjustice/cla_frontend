from django import forms
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

from . import authenticate
from .utils import get_zone_profile


class AuthenticationForm(forms.Form):
    """
    """
    username = forms.CharField(label=_("Username"), max_length=254)
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput)

    error_messages = {
        'invalid_login': _("Please enter a correct %(username)s and password. "
                           "Note that both fields may be case-sensitive."),
        'locked_out': _("Account locked: too many login attempts. Please try again later or contact your Manager."),
        'account_disabled': _("Account disabled, please contact your supervisor.")
    }

    def __init__(self, request=None, *args, **kwargs):
        """
        """
        self.request = request
        self.user_cache = None
        self.zone_name = kwargs.pop('zone_name', None)
        super(AuthenticationForm, self).__init__(*args, **kwargs)

    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if username and password:
            self.user_cache = authenticate(
                self.zone_name, username=username, password=password,
            )

            if self.user_cache is None:
                raise forms.ValidationError(
                    self.error_messages['invalid_login'],
                    code='invalid_login',
                    params={'username': 'username'},
                )

            if self.user_cache.is_locked_out:
                raise forms.ValidationError(
                    self.error_messages['locked_out'],
                    code='locked_out'
                )

            if not self.user_cache.is_active:
                raise forms.ValidationError(
                    self.error_messages['account_disabled'],
                    code='account_disabled'
                )
        return self.cleaned_data

    def get_user_id(self):
        if self.user_cache:
            return self.user_cache.pk
        return None

    def get_user(self):
        return self.user_cache

    def get_login_redirect_url(self):
        zone_profile =  get_zone_profile(self.zone_name)
        if not zone_profile:
            return None
        return reverse(zone_profile['LOGIN_REDIRECT_URL'])
