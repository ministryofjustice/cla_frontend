import logging
import time
import uuid

import msal
import redis

from django.conf import settings


logger = logging.getLogger(__name__)


def _get_scopes():
    raw_scope = (settings.ENTRA_SCOPE or "").strip()
    if not raw_scope:
        return []
    reserved = {"openid", "profile", "offline_access"}
    return [scope for scope in raw_scope.split(" ") if scope and scope not in reserved]


def _build_msal_app(token_cache=None):
    return msal.ConfidentialClientApplication(
        settings.ENTRA_CLIENT_ID,
        authority=settings.ENTRA_AUTHORITY,
        client_credential=settings.ENTRA_CLIENT_SECRET,
        token_cache=token_cache,
    )


def _get_redis_client():
    redis_url = getattr(settings, "ENTRA_TOKEN_CACHE_REDIS_URL", "")
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


def get_valid_access_token(request):
    """Return a valid Entra access token using silent refresh when required."""
    token = request.session.get("entra_access_token")
    expires_at = int(request.session.get("entra_access_token_expires_at", 0) or 0)
    now = int(time.time())
    if token and expires_at and (expires_at - now) > 60:
        return token

    cache_key = request.session.get("entra_token_cache_key")
    cache_blob = _load_cache_blob(cache_key)
    if not cache_blob:
        return token

    token_cache = msal.SerializableTokenCache()
    token_cache.deserialize(cache_blob)
    msal_app = _build_msal_app(token_cache=token_cache)
    scopes = _get_scopes()
    accounts = msal_app.get_accounts()
    if not accounts or not scopes:
        return token

    result = msal_app.acquire_token_silent(scopes=scopes, account=accounts[0])
    if not result or "access_token" not in result:
        if result and "error" in result:
            logger.warning("Entra silent refresh failed: %s", result.get("error"))
        return token

    request.session["entra_access_token"] = result["access_token"]
    expires_in = int(result.get("expires_in", 0) or 0)
    request.session["entra_access_token_expires_at"] = int(time.time()) + expires_in if expires_in else 0
    save_cache_blob(request, token_cache)
    return result["access_token"]


def clear_entra_token_cache(request):
    cache_key = request.session.get("entra_token_cache_key")
    if not cache_key:
        return
    client = _get_redis_client()
    if client:
        try:
            client.delete(cache_key)
        except Exception as exc:
            logger.warning("Unable to delete Entra token cache from Redis: %s", exc)
    request.session["entra_token_cache_key"] = None
    request.session["entra_access_token"] = None
    request.session["entra_access_token_expires_at"] = 0
