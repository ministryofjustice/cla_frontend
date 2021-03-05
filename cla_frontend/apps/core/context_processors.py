import os
from django.conf import settings


def globals(request):
    context = {
        "app_title": "Civil Legal Advice",
        "proposition_title": "Civil Legal Advice",
        "phase": "alpha",
        "product_type": "service",
        "feedback_url": "#",
        "sentry_public_dsn": settings.SENTRY_PUBLIC_DSN,
        "socketio_server_url": settings.SOCKETIO_SERVER_URL,
        "analytics_id": settings.ANALYTICS_ID,
        "analytics_domain": settings.ANALYTICS_DOMAIN,
        "cla_environment": os.environ.get("CLA_ENV", "unknown"),
    }

    if hasattr(request, "zone") and request.zone:
        context["app_base_template"] = "base.html"
        context["zone"] = request.zone

    return context
