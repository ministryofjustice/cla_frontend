import pickle

from django.core.urlresolvers import reverse

from core.testing.testcases import CLATestCase

from ..exceptions import InconsistentStateException

from .fixtures import mocked_api


class CheckerWizardTestCase(CLATestCase):
    def setUp(self):
        super(CheckerWizardTestCase, self).setUp()

        self.mocked_connection.category.get.return_value = mocked_api.CATEGORY_LIST

        self.your_problem_url = reverse(
            'checker:checker_step', args=(), kwargs={'step': 'your_problem'}
        )
        self.your_details_url = reverse(
            'checker:checker_step', args=(), kwargs={'step': 'your_details'}
        )
        self.your_finances_url = reverse('checker:checker_step', args=(),
                                         kwargs={'step': 'your_finances'}
        )
        self.result_url = reverse('checker:checker_step', args=(),
                                         kwargs={'step': 'result'}
        )
        self.apply_url = reverse('checker:checker_step', args=(),
                                         kwargs={'step': 'apply'}
        )

        self.done_url = reverse('checker:confirmation', args=(), kwargs={})

    def test_get_start_page(self):
        """
        Redirects to the first step of the wizard.
        """
        response = self.client.get(reverse('checker:checker'))
        self.assertRedirects(response, self.your_problem_url)

    def test_get_your_problem(self):
        response = self.client.get(self.your_problem_url)
        context_data = response.context_data

        choices = context_data['form'].fields['category'].choices
        self.assertTrue(len(choices), 4)
        self.assertItemsEqual([c[0] for c in choices], [1,2,3,4])

    def _get_your_problem_post_data(self):
        return {
            'your_problem-category': [1],
            'your_problem-notes': u'lorem',
            'checker_wizard-current_step': 'your_problem',
        }

    def _get_your_details_post_data(self):
        return {
            'your_details-has_partner': [1],
            'your_details-has_children': [1],
            'your_details-has_benefits': [1],
            'your_details-risk_homeless': [1],
            'your_details-older_than_sixty': [1],
            'your_details-caring_responsibilities': [1],
            'your_details-own_property': [1],
            'your_details-checker_wizard-current_step': 'your_details',
        }

    def test_sumbmit_your_problem(self):
        data = self._get_your_problem_post_data()

        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE

        response = self.client.post(self.your_problem_url, data=data)
        self.assertRedirects(response, self.your_details_url)
        self.mocked_connection.eligibility_check.post.assert_called()

    def test_get_your_finances(self):
        response = self.client.get(self.your_finances_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)

    def _get_your_finances_post_data(self):
        return {
            "checker_wizard-current_step": "your_finances",
            "property-TOTAL_FORMS": [1],
            "property-INITIAL_FORMS": [0],
            "property-MAX_NUM_FORMS": [20],
            "property-0-worth": [100000],
            "property-0-mortgage_left": [50000],
            "property-0-owner": [1],
            "property-0-share": [100],
            "your_other_properties-other_properties": [u"0"],
            "your_savings-bank": [100],
            "your_savings-investments": [100],
            "your_savings-valuable_items": [100],
            "your_savings-money_owed": [100],
            "partners_savings-bank": [100],
            "partners_savings-investments": [100],
            "partners_savings-valuable_items": [100],
            "partners_savings-money_owed": [100],
            "your_income-earnings_per_month": [100],
            "your_income-other_income_per_month": [100],
            "your_income-self_employed": [0],
            "partners_income-earnings_per_month": [100],
            "partners_income-other_income_per_month": [100],
            "partners_income-self_employed": [0],
            "dependants-dependants_old": [0],
            "dependants-dependants_young": [0],
        }

    def test_post_your_finances(self):
        finances_data = self._get_your_finances_post_data()

        r1 = self.client.get(self.your_finances_url)
        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE_FROM_YOUR_FINANCES
        response = self.client.post(self.your_finances_url, data=finances_data)
        self.assertEqual(response.status_code, 302)

    def test_post_your_finances_with_extra_property(self):
        # Test that ticking yes for 'I own other properties' returns you to the same page
        # with an additional property
        finances_data = {
            "checker_wizard-current_step": "your_finances",
            "property-TOTAL_FORMS": 1,
            "property-INITIAL_FORMS": 0,
            "property-MAX_NUM_FORMS": 20,
            "property-0-worth": 100000,
            "property-0-mortgage_left": 50000,
            "property-0-owner": 1,
            "property-0-share": 100,
            "your_other_properties-other_properties": u"1",
            "your_savings-bank": 100,
            "your_savings-investments": 100,
            "your_savings-valuable_items": 100,
            "your_savings-money_owed": 100,
            "partners_savings-bank": 100,
            "partners_savings-investments": 100,
            "partners_savings-valuable_items": 100,
            "partners_savings-money_owed": 100,
            "your_income-earnings_per_month": 100,
            "your_income-other_income_per_month": 100,
            "your_income-self_employed": 0,
            "partners_income-earnings_per_month": 100,
            "partners_income-other_income_per_month": 100,
            "partners_income-self_employed": 0,
            "dependants-dependants_old": 0,
            "dependants-dependants_young": 0,
            }

        r1 = self.client.get(self.your_finances_url)
        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE_FROM_YOUR_FINANCES
        response = self.client.post(self.your_finances_url, data=finances_data, follow=True)
        self.assertRedirects(response, self.your_finances_url)
        self.assertGreater(len(response.context_data['form'].property),
                           len(r1.context_data['form'].property))

    def test_get_result(self):
        response = self.client.get(self.result_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context_data['wizard']['steps'].current, 'result')
        self.assertEqual(response.context_data['is_eligible'], True)

    def test_post_result(self):
        data = {
            "checker_wizard-current_step": "result",
        }
        r1 = self.client.get(self.result_url)
        response = self.client.post(self.result_url, data=data)
        self.assertRedirects(response, self.apply_url)

    def test_get_apply(self):
        response = self.client.get(self.apply_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context_data['wizard']['steps'].current, 'apply')

    def test_post_apply_fails_without_reference(self):
        data = {
            "checker_wizard-current_step": "apply",
            "contact_details-title": 'mr',
            "contact_details-full_name": 'John Doe',
            "contact_details-postcode": 'SW1H 9AJ',
            "contact_details-street": '102 Petty France',
            "contact_details-town": 'London',
            "contact_details-mobile_phone": '0123456789',
            "contact_details-home_phone": '9876543210',
        }
        r1 = self.client.get(self.apply_url)
        self.assertRaises(InconsistentStateException, self.client.post, self.apply_url, data=data)

    def test_post_apply_success(self):
        data = {
            "checker_wizard-current_step": "apply",
            "contact_details-title": 'mr',
            "contact_details-full_name": 'John Doe',
            "contact_details-postcode": 'SW1H 9AJ',
            "contact_details-street": '102 Petty France',
            "contact_details-town": 'London',
            "contact_details-mobile_phone": '0123456789',
            "contact_details-home_phone": '9876543210',
        }
        r1 = self.client.get(self.apply_url)

        # need to set eligibility check reference in the session
        s = self.client.session
        s['wizard_checker_wizard']['_check_reference'] = 123456789
        s['wizard_checker_wizard'][u'step_data'] = {
            'your_problem': self._get_your_problem_post_data(),
            'your_details': self._get_your_details_post_data(),
            'your_finances': self._get_your_finances_post_data(),
            'result': {}
        }
        s.save()

        self.mocked_connection.case.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE_CASE

        response = self.client.post(self.apply_url, data=data, follow=True)
        self.assertRedirects(response, self.done_url)

        # check that case and eligibility check references are in the session
        s = self.client.session
        self.assertItemsEqual(s['checker_confirmation'].keys(), ['forms_data', 'metadata'])
        self.assertDictEqual(
            s['checker_confirmation']['metadata'],
            {u'case_reference': u'LA-2954-3453', u'eligibility_check_reference': 123456789}
        )


class ConfirmationViewTestCase(CLATestCase):
    def setUp(self):
        super(ConfirmationViewTestCase, self).setUp()

        self.url = reverse('checker:confirmation', args=(), kwargs={})

    def test_get_success(self):
        response = self.client.get(reverse('checker:checker', args=(), kwargs={}))

        # mock session data
        s = self.client.session
        mocked_data = {
            'forms_data': {
                'forms_data': pickle.dumps({
                    'category': 1
                })
            },
            'metadata': {
                'eligibility_check_reference': 123456789,
                'case_reference': 'LA-2954-3453'
            }
        }
        s['checker_confirmation'] = mocked_data
        s.save()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.context_data['history_data'], {
            'category': 1
        })
        self.assertEqual(
            response.context_data['case_reference'],
            mocked_data['metadata']['case_reference']
        )

    def test_404_session_data(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 404)
