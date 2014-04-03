from django.test.testcases import SimpleTestCase

from ..models import ClaUser


class ClaUserTestCase(SimpleTestCase):
    def setUp(self):
        self.token = '123456789'

    def test_pk_as_token(self):
        user = ClaUser(token=self.token)
        self.assertEqual(user.pk, self.token)

    def test_save_doesnt_do_anything(self):
        user = ClaUser(token=self.token)
        user.save()

    def test_is_authenticated_always_returns_true(self):
        user = ClaUser(token=self.token)
        self.assertTrue
