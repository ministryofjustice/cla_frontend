from unittest import TestCase
from django.core.exceptions import ValidationError
from ..fields import RadioBooleanField


class CustomFieldsTest(TestCase):
    def test_radiobooleanfield_rejects_bad_input(self):
        f = RadioBooleanField()
        self.assertFalse(f.valid_value('aif'), msg='RadioBooleanField is allowing bad input')


    def test_radiobooleanfield_required_with_no_input_doesnt_validate(self):
        f = RadioBooleanField(required=True)
        with self.assertRaises(ValidationError):
            f.validate('')

    def test_radiobooleanfield_notrequired_with_no_input_doesnt_validate(self):
        f = RadioBooleanField(required=False)
        self.assertFalse(f.validate(''))

    def test_radiobooleanfield_with_vaild_input_validates(self):
        f = RadioBooleanField()
        self.assertTrue(f.valid_value(u'0'))
        self.assertTrue(f.valid_value(u'1'))
        self.assertTrue(f.valid_value(0))
        self.assertTrue(f.valid_value(1))
        self.assertTrue(f.valid_value(True))
        self.assertTrue(f.valid_value(False))

