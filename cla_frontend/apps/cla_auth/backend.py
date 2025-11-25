import json
import logging
from requests import ConnectionError
from slumber.exceptions import HttpClientError

from django.contrib.auth import load_backend

from api.client import get_auth_connection

from .models import ClaUser
from .utils import get_zone_profile

logger = logging.getLogger(__name__)


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
            connection.oauth2.revoke_token.post(
                {
                    "token": token,
                    "client_id": zone_profile["CLIENT_ID"],
                }
            )

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
