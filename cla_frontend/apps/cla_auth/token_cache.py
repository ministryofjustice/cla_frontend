import logging
import base64
import json
import time
import uuid

import msal
import redis

from django.conf import settings


logger = logging.getLogger(__name__)


def _mask_cache_key(cache_key):
    if not cache_key:
        return None
    if len(cache_key) <= 8:
        return "***"
    return "%s...%s" % (cache_key[:4], cache_key[-4:])


def _get_scopes():
    raw_scope = (settings.ENTRA_SCOPE or "").strip()
    if not raw_scope:
        return []
    reserved = {"openid", "profile", "offline_access"}
    return [scope for scope in raw_scope.split(" ") if scope and scope not in reserved]


def _get_expiry_safety_window_seconds():
    return int(getattr(settings, "ENTRA_TOKEN_EXPIRY_SAFETY_WINDOW", 300))


def _get_token_expiry_from_jwt(token):
    if not token or token.count(".") < 2:
        return 0
    try:
        payload_segment = token.split(".")[1]
        padding = "=" * ((4 - len(payload_segment) % 4) % 4)
        payload_json = base64.urlsafe_b64decode(payload_segment + padding)
        payload = json.loads(payload_json)
        return int(payload.get("exp", 0) or 0)
    except Exception:
        return 0


def _resolve_expires_at(access_token, expires_in=0):
    expires_at = _get_token_expiry_from_jwt(access_token)
    if expires_at:
        return expires_at
    expires_in = int(expires_in or 0)
    return int(time.time()) + expires_in if expires_in else 0


def set_access_token_session(request, access_token, expires_in=0):
    request.session["entra_access_token"] = access_token
    request.session["entra_access_token_expires_at"] = _resolve_expires_at(access_token, expires_in)


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


def get_valid_access_token(request):
    """Return a valid Entra access token using silent refresh when required."""
    token = request.session.get("entra_access_token")
    expires_at = int(request.session.get("entra_access_token_expires_at", 0) or 0)
    now = int(time.time())
    safety_window = _get_expiry_safety_window_seconds()
    if token and not expires_at:
        token_expiry = _get_token_expiry_from_jwt(token)
        if token_expiry:
            request.session["entra_access_token_expires_at"] = token_expiry
            if (token_expiry - now) > safety_window:
                return token
        else:
            # Keep compatibility with older sessions that did not track expiry.
            return token
    if token and expires_at and (expires_at - now) > safety_window:
        token_expiry = _get_token_expiry_from_jwt(token)
        if not token_expiry or (token_expiry - now) > safety_window:
            return token
        logger.info(
            "Session access token is close to JWT expiry; attempting silent refresh",
            extra={
                "ENTRA_TOKEN_EXPIRES_AT": expires_at,
                "ENTRA_JWT_EXP": token_expiry,
            },
        )

    cache_key = request.session.get("entra_token_cache_key")
    cache_blob = _load_cache_blob(cache_key)
    if not cache_blob:
        logger.warning(
            "No Entra token cache found for session",
            extra={
                "ENTRA_CACHE_KEY": _mask_cache_key(cache_key),
                "ENTRA_TOKEN_IN_SESSION": bool(token),
                "ENTRA_TOKEN_EXPIRES_AT": expires_at,
            },
        )
        return None

    token_cache = msal.SerializableTokenCache()
    token_cache.deserialize(cache_blob)
    msal_app = _build_msal_app(token_cache=token_cache)
    scopes = _get_scopes()
    accounts = msal_app.get_accounts()
    if not accounts:
        logger.warning(
            "No account found in Entra MSAL token cache",
            extra={"ENTRA_CACHE_KEY": _mask_cache_key(cache_key)},
        )
        return None

    if not scopes:
        logger.error("No Entra API scopes configured")
        return None

    result = msal_app.acquire_token_silent(scopes=scopes, account=accounts[0])
    if not result or "access_token" not in result:
        logger.warning(
            "Unable to acquire Entra access token silently: %s",
            result.get("error_description") if result else "No result returned",
            extra={
                "ENTRA_CACHE_KEY": _mask_cache_key(cache_key),
                "ENTRA_ERROR": result.get("error") if result else None,
                "ENTRA_SUBERROR": result.get("suberror") if result else None,
            },
        )
        return None

    expires_in = int(result.get("expires_in", 0) or 0)
    set_access_token_session(request, result["access_token"], expires_in)
    logger.info(
        "Entra access token refreshed silently",
        extra={
            "ENTRA_CACHE_KEY": _mask_cache_key(cache_key),
            "ENTRA_EXPIRES_IN": expires_in,
            "ENTRA_TOKEN_EXPIRES_AT": int(request.session.get("entra_access_token_expires_at", 0) or 0),
        },
    )
    save_cache_blob(request, token_cache)
    return result["access_token"]


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
    request.session["entra_access_token"] = None
    request.session["entra_access_token_expires_at"] = 0
