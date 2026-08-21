import logging

import msal

from django.conf import settings


logger = logging.getLogger(__name__)

HOME_ACCOUNT_ID_SESSION_KEY = "entra_home_account_id"
ENTRA_TOKEN_CACHE_SESSION_KEY = "entra_token_cache"


def _get_scopes():
    raw_scope = (settings.ENTRA_SCOPE or "").strip()
    if not raw_scope:
        return []

    reserved = {"openid", "profile", "offline_access"}

    return [
        scope
        for scope in raw_scope.split(" ")
        if scope and scope not in reserved
    ]


def set_home_account_id_session(request, account):
    if not isinstance(account, dict):
        return

    home_account_id = account.get("home_account_id")
    if home_account_id:
        request.session[HOME_ACCOUNT_ID_SESSION_KEY] = home_account_id


def _build_msal_app(token_cache=None):
    return msal.ConfidentialClientApplication(
        settings.ENTRA_CLIENT_ID,
        authority=settings.ENTRA_AUTHORITY,
        client_credential=settings.ENTRA_CLIENT_SECRET,
        token_cache=token_cache,
    )


def _load_token_cache(request):
    token_cache = msal.SerializableTokenCache()

    cache_blob = request.session.get(ENTRA_TOKEN_CACHE_SESSION_KEY)
    if cache_blob:
        try:
            token_cache.deserialize(cache_blob)
        except Exception as exc:
            logger.warning(
                "Unable to deserialize Entra MSAL token cache: %s",
                exc,
            )

    return token_cache


def save_cache_blob(request, token_cache):
    if not token_cache:
        return

    if token_cache.has_state_changed:
        request.session[ENTRA_TOKEN_CACHE_SESSION_KEY] = (
            token_cache.serialize()
        )


def _select_account_for_silent_acquire(request, accounts):
    if not accounts:
        return None

    preferred_home_account_id = request.session.get(
        HOME_ACCOUNT_ID_SESSION_KEY
    )

    if preferred_home_account_id:
        for account in accounts:
            if (
                account.get("home_account_id")
                == preferred_home_account_id
            ):
                return account

    selected_account = accounts[0]
    set_home_account_id_session(request, selected_account)

    return selected_account


def get_valid_access_token(request):
    """
    Return a valid Entra access token using the MSAL token cache.

    MSAL will use a cached access token where possible and silently
    refresh it when required.
    """
    scopes = _get_scopes()
    if not scopes:
        logger.warning("No Entra API scopes configured")
        return None

    token_cache = _load_token_cache(request)
    msal_app = _build_msal_app(token_cache=token_cache)

    accounts = msal_app.get_accounts()
    account = _select_account_for_silent_acquire(
        request,
        accounts,
    )

    if not account:
        logger.debug(
            "No account found in Entra MSAL token cache"
        )
        return None

    result = msal_app.acquire_token_silent(
        scopes=scopes,
        account=account,
    )

    # acquire_token_silent() may update the MSAL cache,
    # for example after refreshing an expired access token.
    save_cache_blob(request, token_cache)

    if not result or "access_token" not in result:
        logger.warning(
            "Unable to acquire Entra access token silently: %s",
            result.get("error_description")
            if result
            else "No result returned",
        )
        return None

    set_home_account_id_session(
        request,
        result.get("account"),
    )

    logger.debug(
        "Entra access token acquired successfully from MSAL"
    )

    return result["access_token"]


def clear_entra_token_cache(request):
    request.session.pop(
        ENTRA_TOKEN_CACHE_SESSION_KEY,
        None,
    )
    request.session.pop(
        HOME_ACCOUNT_ID_SESSION_KEY,
        None,
    )
