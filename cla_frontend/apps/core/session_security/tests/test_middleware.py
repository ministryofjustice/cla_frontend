# coding=utf-8
import datetime
from unittest import TestCase
from mock import MagicMock, patch

from core.session_security.middleware import SessionSecurityMiddleware
from session_security.settings import EXPIRE_AFTER


class TestSessionSecurityMiddleware(TestCase):

    def assertIsAlmostEqualMinutes(self, sec_str, minutes, delta=0.0):
        sec = float(sec_str)
        min = sec / 60
        self.assertAlmostEqual(min, minutes, delta=delta)

    def setUp(self):
        self.middleware = SessionSecurityMiddleware()


    def test_process_response_works_not_logged_in(self):
        # this should not add header

        request = MagicMock(path='/')
        request.method = 'GET'
        before_response = {}
        response = self.middleware.process_response(request, before_response)
        self.assertIsNone(response.get('Session-Expires-In'))


    def test_process_response_works_logged_in_but_without_session(self):
        # this should not add header

        request = MagicMock(path='/')
        request.method = 'GET'
        request.user = MagicMock()
        request.user.is_authenticated.return_value = True
        before_response = {}
        response = self.middleware.process_response(request, before_response)
        self.assertIsNone(response.get('Session-Expires-In'))

    def test_process_response_logged_in_with_session_but_invalid_session_security_key(self):
        request = MagicMock(path='/')
        request.method = 'GET'
        request.user = MagicMock()
        request.user.is_authenticated.return_value = True

        request.session = {
            '_session_security':
                u'cantp😺 😸 😻 😽 😼 🙀 😿 😹 😾arsethisasadate'
        }

        before_response = {}
        with self.assertRaises(UnicodeEncodeError):
            self.middleware.process_response(request, before_response)

    def test_process_response_logged_in_with_session_but_valid_session_security_key(self):
        request = MagicMock(path='/')
        request.method = 'GET'
        request.user = MagicMock()
        request.user.is_authenticated.return_value = True

        request.session = {'_session_security': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')}
        before_response = {}

        response = self.middleware.process_response(request, before_response)
        self.assertIsNotNone(response.get('Session-Expires-In'))
        self.assertIsAlmostEqualMinutes(response.get('Session-Expires-In'), EXPIRE_AFTER//60, delta=1.0)

    def assert_expire_in_extended(self, req_path, should_expire_in,
                                  should_extend, headers=None, query_string=None):
        request = MagicMock(path=req_path)
        request.method = 'GET'
        request.user = MagicMock()
        request.user.is_authenticated.return_value = True
        thirty_mins_ago = (
        datetime.datetime.now() - datetime.timedelta(minutes=30)).strftime(
            '%Y-%m-%dT%H:%M:%S.%f')
        request.session = {'_session_security': thirty_mins_ago}

        if headers:
            request.META = headers

        if query_string:
            request.REQUEST = query_string


        before_response = {}
        response = self.middleware.process_response(request, before_response)
        self.assertIsNotNone(response.get('Session-Expires-In'))

        self.assertIsAlmostEqualMinutes(response.get('Session-Expires-In'),
                                        should_expire_in - 30, delta=1.0)
        self.middleware.process_request(request)
        response2 = self.middleware.process_response(request, before_response)
        self.assertIsNotNone(response2.get('Session-Expires-In'))
        if should_extend:
            self.assertIsAlmostEqualMinutes(response.get('Session-Expires-In'),
                                            should_expire_in, delta=1.0)
        else:
            self.assertIsAlmostEqualMinutes(response.get('Session-Expires-In'),
                                            should_expire_in - 30, delta=1.0)

    def test_process_response_has_extended_expire_time(self):
        self.assert_expire_in_extended('/', EXPIRE_AFTER//60, True)

    def test_process_response_is_not_extended_for_passive_url(self):
        should_expire_in = EXPIRE_AFTER//60

        with patch('core.session_security.middleware.PASSIVE_URLS', ['/foo']):
            self.assert_expire_in_extended('/', should_expire_in, True)
            self.assert_expire_in_extended('/foo', should_expire_in, False)

    def test_process_response_is_not_extended_for_passive_header(self):
        should_expire_in = EXPIRE_AFTER//60

        with patch('core.session_security.middleware.PASSIVE_HEADER', 'foo'):
            self.assert_expire_in_extended('/', should_expire_in, True)
            headers = {'foo': '1'}
            self.assert_expire_in_extended('/', should_expire_in, False, headers=headers)

    def test_process_response_is_not_extended_for_passive_querystring(self):
        should_expire_in = EXPIRE_AFTER//60
        with patch('core.session_security.middleware.PASSIVE_QUERYSTRING', 'foo'):
            self.assert_expire_in_extended('/', should_expire_in, True)
            qs = {'foo': '1'}
            self.assert_expire_in_extended('/', should_expire_in, False, query_string=qs)
