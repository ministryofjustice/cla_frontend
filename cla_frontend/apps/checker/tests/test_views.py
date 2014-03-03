import pickle

from django.core.urlresolvers import reverse

from core.testing.testcases import CLATestCase

from ..exceptions import InconsistentStateException
from ..views import CheckerWizard

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
        self.your_disposable_income_url = reverse('checker:checker_step', args=(),
                                         kwargs={'step': 'your_disposable_income'}
        )
        self.result_url = reverse('checker:checker_step', args=(),
                                         kwargs={'step': 'result'}
        )
        self.apply_url = reverse('checker:checker_step', args=(),
                                         kwargs={'step': 'apply'}
        )

        self.done_url = reverse('checker:confirmation', args=(), kwargs={})

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

    def _get_your_disposable_income_post_data(self):
        return {
            "checker_wizard-current_step": "your_disposable_income",
            "does_pass_disposable_income-passes_test": [1]
            }

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

    def _add_reference_to_session(self, reference=123456789):
        s = self.client.session
        s['wizard_checker_wizard']['_check_reference'] = reference
        s.save()

    def _fill_in_prev_steps(self, current_step, reference=123456789):
        self.client.get(self.your_problem_url)
        s = self.client.session
        s['wizard_checker_wizard']['_check_reference'] = reference

        step_data = {}
        fillers = {
            'your_problem': self._get_your_problem_post_data,
            'your_details': self._get_your_details_post_data,
            'your_finances': self._get_your_finances_post_data,
            'your_disposable_income': self._get_your_disposable_income_post_data,
            'result': lambda : {}
        }
        for step in [x[0] for x in CheckerWizard.form_list]:
            if step == current_step:
                break
            step_data[step] = fillers[step]()
        s['wizard_checker_wizard'][u'step_data'] = step_data
        s.save()

    def test_get_start_page(self):
        """
        Redirects to the first step of the wizard.
        """
        response = self.client.get(reverse('checker:checker'))
        self.assertRedirects(response, self.your_problem_url)

    def _test_cant_skip_steps_redirect_to_step(self, requested_step, expected_redirect_to_step):
        STEP_URL_MAPPER = {
            'your_problem': self.your_problem_url,
            'your_details': self.your_details_url,
            'your_finances': self.your_finances_url,
            'your_disposable_income': self.your_disposable_income_url,
            'result': self.result_url,
            'apply': self.apply_url
        }

        requested_url = STEP_URL_MAPPER[requested_step]
        expected_redirect_to_step_url = STEP_URL_MAPPER[expected_redirect_to_step]

        response_get = self.client.get(requested_url)
        self.assertRedirects(response_get, expected_redirect_to_step_url)

        response_post = self.client.post(requested_url, data={})
        self.assertRedirects(response_post, expected_redirect_to_step_url)

    def test_cant_skip_steps(self):
        """
        Tests that you can't get or post directly a future step
        """
        # TODO: makes tests run slow, change?
        steps = [x[0] for x in CheckerWizard.form_list]
        for index, step in enumerate(steps):
            self._fill_in_prev_steps(current_step=step)

            # test that can't get or post future steps
            for future_step in steps[index+1:]:
                self._test_cant_skip_steps_redirect_to_step(future_step, step)

    def test_get_your_problem(self):
        response = self.client.get(self.your_problem_url)
        context_data = response.context_data

        choices = context_data['form'].fields['category'].choices
        self.assertTrue(len(choices), 4)
        self.assertItemsEqual([c[0] for c in choices], [1,2,3,4])

    def test_sumbmit_your_problem(self):
        data = self._get_your_problem_post_data()

        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE

        response = self.client.post(self.your_problem_url, data=data)
        self.assertRedirects(response, self.your_details_url)
        self.mocked_connection.eligibility_check.post.assert_called()

    def test_get_your_finances(self):
        self._fill_in_prev_steps(current_step='your_finances')

        response = self.client.get(self.your_finances_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)

    def test_post_your_finances(self):
        self._fill_in_prev_steps(current_step='your_finances')

        finances_data = self._get_your_finances_post_data()

        r1 = self.client.get(self.your_finances_url)
        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE_FROM_YOUR_FINANCES
        response = self.client.post(self.your_finances_url, data=finances_data)
        self.assertRedirects(response, self.your_disposable_income_url)

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

        self._fill_in_prev_steps(current_step='your_finances')

        r1 = self.client.get(self.your_finances_url)
        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE_FROM_YOUR_FINANCES
        response = self.client.post(self.your_finances_url, data=finances_data, follow=True)
        self.assertRedirects(response, self.your_finances_url)
        self.assertGreater(len(response.context_data['form'].property),
                           len(r1.context_data['form'].property))

    def test_get_result_is_eligible(self):
        reference = '1234567890'
        self._fill_in_prev_steps(reference=reference, current_step='result')

        self.mocked_connection.eligibility_check(reference).is_eligible().post.return_value = mocked_api.IS_ELIGIBLE_TRUE

        response = self.client.get(self.result_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context_data['wizard']['steps'].current, 'result')
        self.assertEqual(response.context_data['is_eligible'], True)

    def test_get_result_is_not_eligible(self):
        reference = '1234567890'
        self._fill_in_prev_steps(reference=reference, current_step='result')

        self.mocked_connection.eligibility_check(reference).is_eligible().post.return_value = mocked_api.IS_ELIGIBLE_FALSE

        response = self.client.get(self.result_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context_data['wizard']['steps'].current, 'result')
        self.assertEqual(response.context_data['is_eligible'], False)

    def test_post_result(self):
        self._fill_in_prev_steps(current_step='result')

        data = {
            "checker_wizard-current_step": "result",
        }
        r1 = self.client.get(self.result_url)
        response = self.client.post(self.result_url, data=data)
        self.assertRedirects(response, self.apply_url)

    def test_get_apply(self):
        self._fill_in_prev_steps(current_step='apply')

        response = self.client.get(self.apply_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context_data['wizard']['steps'].current, 'apply')

    def test_post_apply_fails_without_reference(self):
        self._fill_in_prev_steps(reference=None, current_step='apply')

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

    def test_post_apply_fails_is_not_eligible(self):
        reference = '1234567890'
        self._fill_in_prev_steps(reference=reference, current_step='apply')

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

        self.mocked_connection.eligibility_check(reference).is_eligible().post.return_value = mocked_api.IS_ELIGIBLE_FALSE
        self.assertRaises(
            InconsistentStateException, self.client.post,
            self.apply_url, data=data
        )

    def test_post_apply_success(self):
        self._fill_in_prev_steps(current_step='apply')

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
