# -*- coding: utf-8 -*-

from django.http import JsonResponse
from django.views.generic.base import View

from cla_frontend.apps.zendesk.client import zendesk_client


class ZendeskView(View):
    def post(self, request):
        "Create a new Zendesk ticket"
        response = zendesk_client.create_ticket(
            feedback_type=request.POST.get("feedback_type", "Comment"),
            feedback_data={
                "comments": request.POST.get("comments"),
                "user": request.user,
                "url": request.POST.get("url"),
                "app_name": request.POST.get("app_name"),
                "user_agent": request.POST.get("user_agent"),
            },
        )

        return JsonResponse(response["json"], status=response["status"])
