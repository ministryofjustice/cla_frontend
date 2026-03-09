import json
import logging
import jwt
import requests
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend

from requests import ConnectionError
from slumber.exceptions import HttpClientError

from django.contrib.auth import load_backend
from django.core.cache import cache
from django.conf import settings

from api.client import get_auth_connection

from .models import ClaUser
from .utils import get_zone_profile

logger = logging.getLogger(__name__)

ROLES = {
    "Civil Legal Advice Helpline Operator Manager": {"ui": "operator", "is_manager": True},
    "Civil Legal Advice Helpline Operator": {"ui": "operator", "is_manager": False},
    "Civil Legal Advice Helpline Provider": {"ui": "provider", "is_manager": False},
    # Todo: remove the below roles from silas
    "Civil Legal Advice Operator": {"ui": "operator", "is_manager": False},
    "Civil Legal Advice - Provider": {"ui": "provider", "is_manager": False},
    "Civil Legal Advice Access": {"ui": "provider", "is_manager": False},
    "Civil Legal Advice - Helpline Operator": {"ui": "operator", "is_manager": False},
}


class EntraTokenDecoder(object):
    def __init__(self, token):
        print("TOKEN", token)
        self.tenant_id = settings.ENTRA_TENANT_ID
        self.expected_audience = settings.ENTRA_TOKEN_EXPECTED_AUDIENCE
        self.issuer = settings.ENTRA_ISSUER_URL
        self.discovery_url = settings.ENTRA_KEYS_URL
        self.token = token

    def decode(self):
        public_key = self.get_public_key()
        cert_str = "-----BEGIN CERTIFICATE-----\n%s\n-----END CERTIFICATE-----" % public_key
        cert_obj = load_pem_x509_certificate(cert_str.encode("utf-8"), default_backend())
        public_key = cert_obj.public_key()
        return jwt.decode(
            self.token, public_key, algorithms=["RS256"], audience=self.expected_audience, issuer=self.issuer
        )

    @property
    def public_keys(self):
        keys = cache.get("entra_public_keys")
        if not keys:
            response = requests.get(self.discovery_url)
            response.raise_for_status()
            keys = response.json().get("keys", [])
            cache.set("entra_public_keys", keys, 86400)
        return keys

    def get_public_key(self, retry=True):
        unverified_header = jwt.get_unverified_header(self.token)
        kid = unverified_header.get("kid")
        key_data = next((k for k in self.public_keys if k["kid"] == kid), None)

        if not key_data and retry:
            cache.delete("entra_public_keys")
            return self.get_public_key(retry=False)["x5c"][0]
        return key_data["x5c"][0]


class EntraBackend(object):
    zone_name = "entra"

    def token_to_user(self, token):
        payload = EntraTokenDecoder(token).decode()
        user = ClaUser(token, self.zone_name)
        roles = payload["APP_ROLES"] if isinstance(payload["APP_ROLES"], list) else [payload["APP_ROLES"]]
        roles = [role for role in roles if role in ROLES]
        user._me_data = {
            "username": payload["preferred_username"],
            "roles": roles,
            "is_manager": any([ROLES[role]["is_manager"] for role in roles]),
            "ui_access": [ROLES[role]["ui"] for role in roles],
        }
        return user

    def authenticate(self, token):
        return self.token_to_user(token["access_token"])

    def get_user(self, token):
        user = self.token_to_user(token)
        return user


class ClaBackend(object):
    """
    Authentication backend for CLA (Civil Legal Advice) system.

    This backend handles user authentication via OAuth2 password grant flow,
    communicating with an external authentication service. It manages user
    authentication, token lifecycle, and handles various authentication states
    including locked out and disabled accounts.

    Attributes:
        zone_name (str): The zone/environment name for authentication context.

    Methods:
        authenticate(username, password):
            Authenticates a user with username and password credentials.

            Args:
                username (str): The user's username.
                password (str): The user's password.

            Returns:
                ClaUser: An authenticated user object with access token, or a user
                        object with special flags (is_locked_out, is_active) set to
                        False for locked/disabled accounts.
                None: If authentication fails or zone profile is not found.

        get_user(token):
            Retrieves a user object from an access token.

            Args:
                token (str): OAuth2 access token.

            Returns:
                ClaUser: User object initialized with the provided token.

        get_this_zone_profile():
            Fetches the authentication configuration for the current zone.

            Returns:
                dict: Zone profile containing CLIENT_ID and CLIENT_SECRET, or None.

        revoke_token(token):
            Revokes an OAuth2 access token.

            Args:
                token (str): The access token to revoke.

            Returns:
                bool: True if revocation was successful, False otherwise.
    """

    zone_name = None

    def authenticate(self, username=None, password=None):
        """
        Authenticate a user with username and password against the OAuth2 backend.

        This method attempts to obtain an access token from the authentication server
        using the password grant type. It handles various error cases including
        server downtime, invalid clients, locked out accounts, and disabled accounts.

        Args:
            username (str, optional): The username for authentication. Defaults to None.
            password (str, optional): The password for authentication. Defaults to None.

        Returns:
            ClaUser: A ClaUser instance with the access token if authentication is successful.
            ClaUser: A ClaUser instance with is_locked_out=True if the account is locked.
            ClaUser: A ClaUser instance with is_active=False if the account is disabled.
            None: If zone_profile is not found, server is down, or other authentication errors occur.

        Raises:
            No exceptions are raised; errors are handled internally and logged.

        Note:
            - Requires a valid zone_profile to proceed with authentication.
            - Logs errors for invalid client credentials.
            - Returns special ClaUser instances for locked out and disabled accounts
              following Django's convention for inactive users.
        """
        zone_profile = self.get_this_zone_profile()
        if not zone_profile:
            return None

        connection = get_auth_connection()
        response = None
        try:
            response = connection.oauth2.access_token.post(
                {
                    "client_id": zone_profile["CLIENT_ID"],
                    "client_secret": zone_profile["CLIENT_SECRET"],
                    "grant_type": "password",
                    "username": username,
                    "password": password,
                }
            )
        except ConnectionError:
            # the server is down
            return
        except HttpClientError as hcerr:
            error = json.loads(hcerr.content)
            error = error.get("error")

            if error == "invalid_client":
                # the client is invalid log it
                "Client used to authenticate with backend is invalid. {}: {}".format(hcerr, error)
                logger.error(hcerr.message)

            if error == "locked_out":
                # this is the django way of dealing with these cases, return a User
                # with is_xxx == False. The user is authenticated but inactive atm.
                user = ClaUser(None, self.zone_name)
                user.is_locked_out = True
                return user

            if error == "account_disabled":
                # this is the django way of dealing with these cases, return a User
                # with is_xxx == False. The user is authenticated but inactive atm.
                user = ClaUser(None, self.zone_name)
                user.is_active = False
                return user
            return

        user = ClaUser(response["access_token"], self.zone_name)
        return user

    def get_user(self, token):
        """
        Retrieve a CLA user instance from the provided token.

        Args:
            token: The authentication token used to identify and authenticate the user.

        Returns:
            ClaUser: A ClaUser instance initialized with the provided token and zone name.
        """
        return ClaUser(token, self.zone_name)

    def get_this_zone_profile(self):
        """
        Retrieves the zone profile for this instance's zone.

        Returns:
            The zone profile object associated with this instance's zone_name.
            The specific return type depends on the get_zone_profile function implementation.

        Raises:
            May raise exceptions depending on the get_zone_profile function implementation.
        """
        return get_zone_profile(self.zone_name)

    def revoke_token(self, token):
        """
        Revoke an OAuth2 token for the current zone.

        This method revokes the specified OAuth2 token by making a POST request to the
        authorization server's token revocation endpoint.

        Args:
            token (str): The OAuth2 token to be revoked (access token or refresh token).

        Returns:
            bool: True if the token was successfully revoked, False otherwise.
                Returns False if:
                - The zone profile is not available
                - The token is None or empty
                - An exception occurs during the revocation process

        Raises:
            No exceptions are raised. All errors are caught, logged, and result in
            a False return value.

        Note:
            Errors during token revocation are logged using the logger at ERROR level.
        """

        zone_profile = self.get_this_zone_profile()
        if not zone_profile or not token:
            return False

        connection = get_auth_connection()

        try:
            connection.oauth2.revoke_token.post({"token": token, "client_id": zone_profile["CLIENT_ID"]})

            return True
        except Exception as error:
            logger.error("An error has occurred while revoking the token: %s", error)
            return False


def get_backend(zone_name):
    """
    Retrieve and instantiate the authentication backend for a given zone.

    Args:
        zone_name (str): The name of the zone for which to retrieve the authentication backend.

    Returns:
        class or None: The authentication backend class for the specified zone, or None if the zone
                       profile cannot be found.

    Raises:
        May raise exceptions from load_backend() if the backend path is invalid or the backend
        class cannot be loaded.

    Note:
        This function retrieves the zone profile configuration, extracts the authentication backend
        path, and loads the corresponding backend class using the load_backend utility function.
    """
    zone_profile = get_zone_profile(zone_name)
    if not zone_profile:
        return None

    backend_path = zone_profile["AUTHENTICATION_BACKEND"]
    backend_class = load_backend(backend_path)
    return backend_class
