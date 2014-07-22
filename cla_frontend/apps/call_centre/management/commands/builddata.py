""""
usage-
./manage.py builddata constants_json

Creates derived dataset of constants used by JS frontend.
Data is sourced from cla_common.

"""
from django.core.management.base import BaseCommand
import json

# used by constants_json
from cla_common.constants import ADAPTATION_LANGUAGES, ELIGIBILITY_STATES, \
    TITLES, REQUIRES_ACTION_BY, THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP, \
    DIAGNOSIS_SCOPE


class Command(BaseCommand):
    args = 'constants_json | another_derivation'
    help = 'Create a derived dataset. At present, just constants_json is implemented.'

    constants_json_OUTPUT_FILE = 'cla_frontend/assets-src/javascripts/app/constants.json'

    def handle(self, *args, **options):

        if 'constants_json' in args:
            l_count = 0
            l = {}
            for json_name, iterator in [('REQUIRES_ACTION_BY', REQUIRES_ACTION_BY.CHOICES),
                                        ('TITLES', TITLES.CHOICES),
                                        ('THIRDPARTY_REASON', THIRDPARTY_REASON),
                                        ('THIRDPARTY_RELATIONSHIP', THIRDPARTY_RELATIONSHIP),
                                        ('ADAPTATION_LANGUAGES', ADAPTATION_LANGUAGES)
                                        ]:
                l[json_name] = []
                for k, v in iterator:
                    l[json_name].append({'value':k,'text':v})
                    l_count += 1

            for json_name, iterator in [('ELIGIBILITY_STATES', ELIGIBILITY_STATES.CHOICES_CONST_DICT),
                                        ('DIAGNOSIS_SCOPE', DIAGNOSIS_SCOPE.CHOICES_CONST_DICT)
                                        ]:
                l[json_name] = iterator

            as_json = json.dumps(l)
            f = open(self.constants_json_OUTPUT_FILE, "w")
            f.write(as_json)
            f.close()

            self.stdout.write("Wrote %s records to '%s'" % (l_count, self.constants_json_OUTPUT_FILE))
