from django.core.urlresolvers import reverse

from core.testing.testcases import CLATestCase

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

        self.done_url = reverse('checker:result', args=(), kwargs={})

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

    def test_sumbmit_your_problem(self):
        data = {
            'your_problem-category': 1,
            'your_problem-notes': u'lorem',
            'checker_wizard-current_step': 'your_problem',
        }

        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_CREATE

        response = self.client.post(self.your_problem_url, data=data)
        self.assertRedirects(response, self.your_details_url)
        self.mocked_connection.eligibility_check.post.assert_called()

    def test_get_your_finances(self):
        response = self.client.get(self.your_finances_url)
        self.assertTrue('sessionid' in response.cookies)
        self.assertEqual(response.status_code, 200)


    def test_post_your_finances(self):
        finances_data = {
            "checker_wizard-current_step": "your_finances",
            "property-TOTAL_FORMS": 1,
            "property-INITIAL_FORMS": 0,
            "property-MAX_NUM_FORMS": 20,
            "property-0-worth": 100000,
            "property-0-mortgage_left": 50000,
            "property-0-owner": 1,
            "property-0-share": 100,
            "your_other_properties-other_properties": u"0",
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

