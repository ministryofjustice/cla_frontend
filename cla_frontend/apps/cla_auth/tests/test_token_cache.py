import mock

from django.test.testcases import SimpleTestCase

from .. import token_cache


class TokenCacheTestCase(SimpleTestCase):
    def _make_request(self, session_data=None):
        request = mock.MagicMock()
        request.session = session_data or {}
        return request

    def test_get_valid_access_token_prefers_msal_when_cache_exists(
        self,
    ):
        request = self._make_request()

        with mock.patch.object(token_cache, "_get_scopes", return_value=["api://test/.default"]), mock.patch.object(
            token_cache, "_load_token_cache"
        ) as mock_load_cache, mock.patch.object(token_cache, "_build_msal_app") as mock_build_app, mock.patch.object(
            token_cache, "save_cache_blob"
        ) as mock_save_cache:
            fake_cache = mock.MagicMock()
            mock_load_cache.return_value = fake_cache

            fake_app = mock.MagicMock()
            fake_app.get_accounts.return_value = [{"home_account_id": "abc"}]
            fake_app.acquire_token_silent.return_value = {
                "access_token": "cache-token",
                "expires_in": 1200,
            }
            mock_build_app.return_value = fake_app

            result = token_cache.get_valid_access_token(request)

        self.assertEqual(result, "cache-token")
        mock_save_cache.assert_called_once_with(request, fake_cache)
        mock_load_cache.assert_called_once_with(request)

    def test_get_valid_access_token_returns_none_when_cache_missing(self):
        request = self._make_request()

        with mock.patch.object(token_cache, "_get_scopes", return_value=["api://test/.default"]), mock.patch.object(
            token_cache, "_load_token_cache"
        ) as mock_load_cache, mock.patch.object(token_cache, "_build_msal_app") as mock_build_app:
            mock_load_cache.return_value = mock.MagicMock()
            fake_app = mock.MagicMock()
            fake_app.get_accounts.return_value = []
            mock_build_app.return_value = fake_app

            result = token_cache.get_valid_access_token(request)

        self.assertIsNone(result)

    def test_set_home_account_id_session_sets_value(self):
        request = self._make_request()

        token_cache.set_home_account_id_session(request, {"home_account_id": "home-123"})

        self.assertEqual(request.session["entra_home_account_id"], "home-123")

    def test_get_valid_access_token_uses_home_account_id_when_available(
        self,
    ):
        request = self._make_request(
            {
                "entra_home_account_id": "home-2",
            }
        )

        with mock.patch.object(token_cache, "_get_scopes", return_value=["api://test/.default"]), mock.patch.object(
            token_cache, "_load_token_cache"
        ) as mock_load_cache, mock.patch.object(token_cache, "_build_msal_app") as mock_build_app, mock.patch.object(
            token_cache, "save_cache_blob"
        ):
            fake_cache = mock.MagicMock()
            mock_load_cache.return_value = fake_cache

            account_1 = {"home_account_id": "home-1"}
            account_2 = {"home_account_id": "home-2"}
            fake_app = mock.MagicMock()
            fake_app.get_accounts.return_value = [account_1, account_2]
            fake_app.acquire_token_silent.return_value = {
                "access_token": "new-token",
                "expires_in": 1200,
                "account": account_2,
            }
            mock_build_app.return_value = fake_app

            result = token_cache.get_valid_access_token(request)

        self.assertEqual(result, "new-token")
        fake_app.acquire_token_silent.assert_called_once_with(
            scopes=mock.ANY,
            account=account_2,
        )

    def test_get_valid_access_token_returns_none_when_no_accounts(
        self,
    ):
        request = self._make_request()

        with mock.patch.object(token_cache, "_get_scopes", return_value=["api://test/.default"]), mock.patch.object(
            token_cache, "_load_token_cache"
        ) as mock_load_cache, mock.patch.object(token_cache, "_build_msal_app") as mock_build_app:
            fake_cache = mock.MagicMock()
            mock_load_cache.return_value = fake_cache

            fake_app = mock.MagicMock()
            fake_app.get_accounts.return_value = []
            mock_build_app.return_value = fake_app

            result = token_cache.get_valid_access_token(request)

        self.assertIsNone(result)

    def test_get_valid_access_token_returns_none_when_silent_acquire_fails(
        self,
    ):
        request = self._make_request()

        with mock.patch.object(token_cache, "_get_scopes", return_value=["api://test/.default"]), mock.patch.object(
            token_cache, "_load_token_cache"
        ) as mock_load_cache, mock.patch.object(token_cache, "_build_msal_app") as mock_build_app:
            fake_cache = mock.MagicMock()
            mock_load_cache.return_value = fake_cache

            fake_app = mock.MagicMock()
            fake_app.get_accounts.return_value = [{"home_account_id": "abc"}]
            fake_app.acquire_token_silent.return_value = {"error_description": "interaction required"}
            mock_build_app.return_value = fake_app

            result = token_cache.get_valid_access_token(request)

        self.assertIsNone(result)
