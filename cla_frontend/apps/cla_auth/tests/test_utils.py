from django.test.testcases import SimpleTestCase
from django.conf import settings

from ..utils import get_zone_profile


class GetZoneProfileTestCase(SimpleTestCase):
    def test_invalid_zone_name(self):
        zone_profile = get_zone_profile("invalid_zone")
        self.assertEqual(zone_profile, None)

    def test_valid_zone_name(self):
        zone_name = settings.ZONE_PROFILES.keys()[0]
        zone_profile = settings.ZONE_PROFILES[zone_name]

        zone_profile = get_zone_profile(zone_name)
        self.assertEqual(zone_profile, zone_profile)
