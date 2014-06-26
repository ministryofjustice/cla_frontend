""""
usage-
./manage.py builddata constants_json

Creates derived dataset of constants used by JS Data is sourced from cla_common.

"""
from django.core.management.base import BaseCommand, CommandError
from pprint import pprint

import json

# used by constants_json
from cla_common.constants import ADAPTATION_LANGUAGES, ELIGIBILITY_STATES, TITLES, CASE_STATES,\
                                THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP

class Command(BaseCommand):
    args = 'constants_json | another_derivation'
    help = 'Create a derived dataset. At present, just constants_json is implemented.'
    
    constants_json_OUTPUT_FILE = 'cla_frontend/assets-src/javascripts/app/config.json'

    def handle(self, *args, **options):

        if 'constants_json' in args:
            l_count = 0
            l = {}
            for json_name, iterator in [('case_states', CASE_STATES.CHOICES),
                                        ('eligibility_states', ELIGIBILITY_STATES.CHOICES),
                                        ('titles', TITLES.CHOICES),
                                        ('thirdparty_reason', THIRDPARTY_REASON),
                                        ('thirdparty_relationship', THIRDPARTY_RELATIONSHIP),
                                        ('adaptation_languages', ADAPTATION_LANGUAGES)
                                        ]:
                l[json_name] = []
                for k, v in iterator:
                    l[json_name].append((k,v))
                    l_count += 1

            as_json = json.dumps(l)
            f = open(self.constants_json_OUTPUT_FILE, "w")
            f.write(as_json)
            f.close()

            self.stdout.write("Wrote %s records to '%s'" % (l_count, self.constants_json_OUTPUT_FILE))
