import mock
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.test import RequestFactory
from django.test.testcases import SimpleTestCase
from django.conf import settings

from ..utils import get_zone_profile, zone_required


class GetZoneProfileTestCase(SimpleTestCase):
    def test_invalid_zone_name(self):
        zone_profile = get_zone_profile("invalid_zone")
        self.assertEqual(zone_profile, None)

    def test_valid_zone_name(self):
        zone_name = settings.ZONE_PROFILES.keys()[0]
        zone_profile = settings.ZONE_PROFILES[zone_name]

        zone_profile = get_zone_profile(zone_name)
        self.assertEqual(zone_profile, zone_profile)


class ZoneRequiredTestCase(SimpleTestCase):
    def setUp(self):
        self.request = RequestFactory()

    @staticmethod
    def dummy_view(request):
        return HttpResponse("Success")

    def test_zone_required_call_centre_correct_ui(self):
        request = self.request.get("/call_centre")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_to_ui.return_value = ["operator"]
        request.user = user
        request.zone = get_zone_profile("call_centre")

        decorated = zone_required(ui="operator")(self.dummy_view)
        response = decorated(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, "Success")

    def test_zone_required_call_centre_incorrect_ui(self):
        request = self.request.get("/call_centre")
        user = mock.Mock()
        user.is_authenticated.return_value = True
        user.zone_to_ui.return_value = ["provider"]
        request.user = user
        request.zone = get_zone_profile("call_centre")

        decorated = zone_required(ui="operator")(self.dummy_view)
        response = decorated(request)
        self.assertEqual(response.status_code, 302)

        redirect_path = reverse(request.zone.get("LOGIN_REDIRECT_URL"))
        redirect = "%s?next=%s" % (redirect_path, redirect_path)
        self.assertEqual(response.url, redirect.rstrip("/"))

    def test_zone_required_unauthenticated_user(self):
        request = self.request.get("/call_centre")
        user = mock.Mock()
        user.is_authenticated.return_value = False
        request.user = user
        request.zone = get_zone_profile("call_centre")

        decorated = zone_required(ui="operator")(self.dummy_view)
        response = decorated(request)
        self.assertEqual(response.status_code, 302)

        redirect_path = reverse(request.zone.get("LOGIN_REDIRECT_URL"))
        redirect = "%s?next=%s" % (redirect_path, redirect_path)
        self.assertEqual(response.url, redirect.rstrip("/"))
