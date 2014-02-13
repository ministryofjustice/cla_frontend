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
