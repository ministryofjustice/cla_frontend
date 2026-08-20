import logging
import uuid

import msal
import redis

from django.conf import settings


logger = logging.getLogger(__name__)
HOME_ACCOUNT_ID_SESSION_KEY = "entra_home_account_id"


def _get_scopes():
    raw_scope = (settings.ENTRA_SCOPE or "").strip()
    if not raw_scope:
        return []
    reserved = {"openid", "profile", "offline_access"}
    return [scope for scope in raw_scope.split(" ") if scope and scope not in reserved]


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


def _get_redis_client():
    redis_url = getattr(settings, "ELASTICACHE_REDIS_URL", "")
    if not redis_url:
        return None
    try:
        return redis.StrictRedis.from_url(redis_url)
    except Exception as exc:
        logger.warning("Unable to initialize Entra Redis client: %s", exc)
        return None


def _get_cache_key(request):
    cache_key = request.session.get("entra_token_cache_key")
    if cache_key:
        return cache_key

    cache_key = "%s:%s" % (settings.ENTRA_TOKEN_CACHE_KEY_PREFIX, uuid.uuid4().hex)
    request.session["entra_token_cache_key"] = cache_key
    return cache_key


def _store_cache_blob(cache_key, cache_blob):
    client = _get_redis_client()
    if not client:
        return
    ttl_seconds = int(getattr(settings, "ENTRA_TOKEN_CACHE_TTL", 24 * 60 * 60))
    try:
        client.setex(cache_key, ttl_seconds, cache_blob)
    except Exception as exc:
        logger.warning("Unable to persist Entra token cache in Redis: %s", exc)


def _load_cache_blob(cache_key):
    client = _get_redis_client()
    if not client or not cache_key:
        return None
    try:
        data = client.get(cache_key)
    except Exception as exc:
        logger.warning("Unable to read Entra token cache from Redis: %s", exc)
        return None
    if not data:
        return None
    if isinstance(data, bytes):
        return data.decode("utf-8")
    return data


def save_cache_blob(request, token_cache):
    if not token_cache:
        return
    cache_key = _get_cache_key(request)
    cache_blob = token_cache.serialize()
    if cache_blob:
        _store_cache_blob(cache_key, cache_blob)


def _select_account_for_silent_acquire(request, accounts):
    if not accounts:
        return None

    preferred_home_account_id = request.session.get(HOME_ACCOUNT_ID_SESSION_KEY)
    if preferred_home_account_id:
        for account in accounts:
            if account.get("home_account_id") == preferred_home_account_id:
                return account

    selected_account = accounts[0]
    set_home_account_id_session(request, selected_account)
    return selected_account


def get_valid_access_token(request):
    """Return an Entra access token from MSAL cache using silent acquisition."""
    cache_key = request.session.get("entra_token_cache_key")
    cache_blob = _load_cache_blob(cache_key)
    if cache_blob:
        token_cache = msal.SerializableTokenCache()
        token_cache.deserialize(cache_blob)
        msal_app = _build_msal_app(token_cache=token_cache)
        scopes = _get_scopes()
        if not scopes:
            logger.error("No Entra API scopes configured")
            return None

        accounts = msal_app.get_accounts()
        account = _select_account_for_silent_acquire(request, accounts)
        if not account:
            logger.debug("No account found in Entra MSAL token cache")
            return None

        result = msal_app.acquire_token_silent(scopes=scopes, account=account)
        if not result or "access_token" not in result:
            logger.warning(
                "Unable to acquire Entra access token silently: %s",
                result.get("error_description") if result else "No result returned",
            )
            return None

        set_home_account_id_session(request, result.get("account"))
        logger.debug("Entra access token refreshed silently")
        save_cache_blob(request, token_cache)
        return result["access_token"]

    logger.debug("No Entra token cache found for session")
    return None


def clear_entra_token_cache(request):
    cache_key = request.session.get("entra_token_cache_key")
    if cache_key:
        client = _get_redis_client()
        if client:
            try:
                client.delete(cache_key)
            except Exception as exc:
                logger.warning("Unable to delete Entra token cache from Redis: %s", exc)
    request.session["entra_token_cache_key"] = None
    request.session[HOME_ACCOUNT_ID_SESSION_KEY] = None
    request.session["entra_access_token"] = None
    request.session["entra_access_token_expires_at"] = 0
