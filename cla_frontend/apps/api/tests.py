import mock

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.test import RequestFactory
from django.test.testcases import SimpleTestCase

from api.client import get_connection


class GetConnectionTestCase(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def _make_request(self, user, zone):
        request = self.factory.get("/proxy/case/")
        request.user = user
        request.zone = zone
        return request

    def _authenticated_user(self):
        user = mock.MagicMock()
        user.is_authenticated.return_value = True
        return user

    def test_anonymous_user_raises_permission_denied(self):
        request = self._make_request(user=AnonymousUser(), zone=mock.MagicMock())
        with self.assertRaises(PermissionDenied):
            get_connection(request)

    def test_no_user_raises_permission_denied(self):
        request = self._make_request(user=None, zone=mock.MagicMock())
        with self.assertRaises(PermissionDenied):
            get_connection(request)

    def test_no_zone_raises_permission_denied(self):
        request = self._make_request(user=self._authenticated_user(), zone=None)
        with self.assertRaises(PermissionDenied):
            get_connection(request)

    def test_authenticated_user_with_zone_returns_connection(self):
        user = self._authenticated_user()
        mock_connection = mock.MagicMock()
        user.get_raw_connection.return_value = mock_connection

        request = self._make_request(user=user, zone=mock.MagicMock())
        result = get_connection(request)

        self.assertEqual(result, mock_connection)
        user.get_raw_connection.assert_called_once()
