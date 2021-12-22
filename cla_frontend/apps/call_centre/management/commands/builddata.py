""""
usage-
./manage.py builddata constants_json

Creates derived dataset of constants used by JS frontend.
Data is sourced from cla_common.

"""
import json

from django.core.management.base import BaseCommand
from django.templatetags.static import static

# used by constants_json
from cla_common.constants import (
    ADAPTATION_LANGUAGES,
    ELIGIBILITY_STATES,
    TITLES,
    REQUIRES_ACTION_BY,
    THIRDPARTY_REASON,
    THIRDPARTY_RELATIONSHIP,
    DIAGNOSIS_SCOPE,
    CONTACT_SAFETY,
    EXEMPT_USER_REASON,
    ECF_OPTIONS,
    FEEDBACK_ISSUE,
    CASE_SOURCE,
    GENDERS,
    ETHNICITIES,
    RELIGIONS,
    SEXUAL_ORIENTATIONS,
    DISABILITIES,
    ETHNICITIES_GROUPS,
    SPECIFIC_BENEFITS,
    DISREGARDS,
    EXPRESSIONS_OF_DISSATISFACTION,
    EXPRESSIONS_OF_DISSATISFACTION_FLAGS,
    RESEARCH_CONTACT_VIA,
)


class Command(BaseCommand):
    args = "constants_json | another_derivation"
    help = "Create a derived dataset. At present, just constants_json is implemented."

    constants_json_OUTPUT_FILE = "cla_frontend/assets-src/javascripts/app/constants.json"

    def handle(self, *args, **options):

        if "constants_json" in args:
            count = 0
            derived_dataset = {}
            for json_name, iterator in [
                ("TITLES", TITLES.CHOICES),
                ("THIRDPARTY_REASON", THIRDPARTY_REASON),
                ("THIRDPARTY_RELATIONSHIP", THIRDPARTY_RELATIONSHIP),
                ("ADAPTATION_LANGUAGES", ADAPTATION_LANGUAGES),
                ("EXEMPT_USER_REASON", EXEMPT_USER_REASON),
                ("FEEDBACK_ISSUE", FEEDBACK_ISSUE),
                ("CASE_SOURCE", CASE_SOURCE),
                ("RESEARCH_CONTACT_VIA", RESEARCH_CONTACT_VIA),
                ("GENDERS", GENDERS),
                ("RELIGIONS", RELIGIONS),
                ("SEXUAL_ORIENTATIONS", SEXUAL_ORIENTATIONS),
                ("DISABILITIES", DISABILITIES),
                ("SPECIFIC_BENEFITS", SPECIFIC_BENEFITS),
                ("DISREGARDS", DISREGARDS),
                ("EXPRESSIONS_OF_DISSATISFACTION", EXPRESSIONS_OF_DISSATISFACTION),
            ]:
                derived_dataset[json_name] = []
                for k, v in iterator:
                    derived_dataset[json_name].append({"value": k, "text": v})
                    count += 1

            for json_name, iterator in [
                ("REQUIRES_ACTION_BY", REQUIRES_ACTION_BY.CHOICES_CONST_DICT),
                ("ELIGIBILITY_STATES", ELIGIBILITY_STATES.CHOICES_CONST_DICT),
                ("DIAGNOSIS_SCOPE", DIAGNOSIS_SCOPE.CHOICES_CONST_DICT),
                ("CONTACT_SAFETY", CONTACT_SAFETY.CHOICES_CONST_DICT),
                ("EXPRESSIONS_OF_DISSATISFACTION_FLAGS", EXPRESSIONS_OF_DISSATISFACTION_FLAGS),
            ]:
                derived_dataset[json_name] = iterator
                count += 1

            for json_name, iterator in [("ECF_STATEMENT", ECF_OPTIONS)]:
                derived_dataset[json_name] = iterator
                count += 1

            for json_name, iterator, groups in [("ETHNICITIES", ETHNICITIES, ETHNICITIES_GROUPS)]:
                derived_dataset[json_name] = []
                for k, v in iterator:
                    group = None
                    for group_k, group_v in groups.items():
                        if k in group_v:
                            group = group_k

                    derived_dataset[json_name].append({"value": k, "text": v, "group": group})
                    count += 1

            derived_dataset["STATIC_ROOT"] = static(".")
            count += 1

            as_json = json.dumps(derived_dataset)
            f = open(self.constants_json_OUTPUT_FILE, "w")
            f.write(as_json)
            f.close()

            self.stdout.write("Wrote %s records to '%s'" % (count, self.constants_json_OUTPUT_FILE))
