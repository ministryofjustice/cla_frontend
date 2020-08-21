from django.test import SimpleTestCase


class MaintenanceModeTestCase(SimpleTestCase):
    def test_maintenance_mode_enabled_home_page(self):
        with self.settings(MAINTENANCE_MODE=True):
            response = self.client.get("/", follow=True)
            self.assertEqual(503, response.status_code)
            self.assertIn("This service is down for maintenance", response.content)
            self.assertEqual([("http://testserver/maintenance", 302)], response.redirect_chain)

    def test_maintenance_mode_enabled_maintenance_page(self):
        with self.settings(MAINTENANCE_MODE=True):
            response = self.client.get("/maintenance", follow=False)
            self.assertEqual(503, response.status_code)
            self.assertIn("This service is down for maintenance", response.content)

    def test_maintenance_mode_disabled_home_page(self):
        with self.settings(MAINTENANCE_MODE=False):
            response = self.client.get("/", follow=True)
            self.assertEqual(200, response.status_code)
            self.assertNotIn("This service is down for maintenance", response.content)

    def test_maintenance_mode_disabled_maintenance_page(self):
        with self.settings(MAINTENANCE_MODE=False):
            response = self.client.get("/maintenance", follow=True)
            self.assertEqual(200, response.status_code)
            self.assertEqual(("http://testserver/", 302), response.redirect_chain[0])
            self.assertNotIn("This service is down for maintenance", response.content)
