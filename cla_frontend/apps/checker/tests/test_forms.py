from core.testing.testcases import CLATestCase

from ..forms import YourProblemForm, YourFinancesForm

from .fixtures import mocked_api


class YourFinancesFormTestCase(CLATestCase):

    def setUp(self):
        super(YourFinancesFormTestCase, self).setUp()
        self.mocked_connection.eligibility_check.post.return_value = mocked_api.ELIGIBILITY_CHECK_UPDATE

    def test_get(self):
        # TEST: a blank GET to the this form - all subforms should be visible

        form = YourFinancesForm()

        self.assertSetEqual(set(dict(form.forms_list).keys()),
                             {'your_savings',
                              'partners_savings',
                              'partners_income',
                              'your_other_properties',
                              'dependants',
                              'your_income'})

        self.assertSetEqual(set(dict(form.formset_list).keys()), {'property'})

    def test_get_no_partner(self):
        # TEST: no questions about partner should be visible
        # if the form was created with a has_partner=False kwarg

        form = YourFinancesForm(has_partner=False)
        self.assertSetEqual(set(dict(form.forms_list).keys()),
                            {'your_savings',
                              'your_other_properties',
                              'dependants',
                              'your_income'})
        self.assertSetEqual(set(dict(form.formset_list).keys()), {'property'})

    def test_get_no_children(self):
        # TEST: no forms related to children should be show
        # if form instantiated with has_children=Falase

        form = YourFinancesForm(has_children=False)
        self.assertSetEqual(set(dict(form.forms_list).keys()),
                           {'your_savings',
                              'partners_savings',
                              'partners_income',
                              'your_other_properties',
                              'your_income'})
        self.assertSetEqual(set(dict(form.formset_list).keys()), {'property'})

    def test_get_no_property(self):
        form = YourFinancesForm(has_property=False)
        self.assertSetEqual(set(dict(form.forms_list).keys()),
                            {'your_savings',
                             'partners_savings',
                             'partners_income',
                             'dependants',
                             'your_income'})

        self.assertSetEqual(set(dict(form.formset_list).keys()), set())


    def test_get_no_property_no_children(self):
        form = YourFinancesForm(has_property=False, has_children=False)
        self.assertSetEqual(set(dict(form.forms_list).keys()),
                            {'your_savings',
                             'partners_savings',
                             'partners_income',
                             'your_income'})

        self.assertSetEqual(set(dict(form.formset_list).keys()), set())

    def test_get_no_property_no_children_no_partner(self):
        form = YourFinancesForm(has_property=False, has_children=False, has_partner=False)
        self.assertSetEqual(set(dict(form.forms_list).keys()),
                            {'your_savings',
                             'your_income'})

        self.assertSetEqual(set(dict(form.formset_list).keys()), set())

    def test_get_has_single_new_property(self):
        form = YourFinancesForm()
        self.assertTrue(len(form.property.forms), 1)

    def _get_default_post_data(self):
        return {
            u'dependants-dependants_old': u'1',
            u'dependants-dependants_young': u'1',
            u'partners_income-earnings_per_month': u'100',
            u'partners_income-other_income_per_month': u'100',
            u'partners_income-self_employed': u'0',
            u'partners_savings-bank': u'100',
            u'partners_savings-investments': u'100',
            u'partners_savings-money_owed': u'100',
            u'partners_savings-valuable_items': u'100',
            u'property-0-mortgage_left': u'50000',
            u'property-0-owner': u'1',
            u'property-0-share': u'100',
            u'property-0-worth': u'100000',
            u'property-INITIAL_FORMS': u'0',
            u'property-MAX_NUM_FORMS': u'20',
            u'property-TOTAL_FORMS': u'1',
            u'your_income-earnings_per_month': u'100',
            u'your_income-other_income_per_month': u'100',
            u'your_income-self_employed': u'0',
            u'your_other_properties-other_properties': u'0',
            u'your_savings-bank': u'100',
            u'your_savings-investments': u'100',
            u'your_savings-money_owed': u'100',
            u'your_savings-valuable_items': u'100'}

    def test_post(self):
        # TEST post with full data, simple case
        form = YourFinancesForm(data=self._get_default_post_data())


        self.assertTrue(form.dependants.is_valid())
        self.assertTrue(form.your_other_properties.is_valid())
        self.assertTrue(form.your_income.is_valid())
        self.assertTrue(form.partners_income.is_valid())
        self.assertTrue(form.your_savings.is_valid())
        self.assertTrue(form.partners_savings.is_valid())
        for f in form.property:
            self.assertTrue(f.is_valid())


    def test_post_subform_dependants(self):
        # TEST post with full data, simple case
        form = YourFinancesForm(data=self._get_default_post_data())


        self.assertTrue(form.dependants.is_valid())
        self.assertEqual(form.dependants.cleaned_data['dependants_young'], 1)
        self.assertEqual(form.dependants.cleaned_data['dependants_old'], 1)

        self.assertTrue(form.your_other_properties.is_valid())
        self.assertEqual(form.your_other_properties.cleaned_data['other_properties'], False)


    def test_post_subform_other_properties(self):
        # TEST post with full data, simple case
        form = YourFinancesForm(data=self._get_default_post_data())

        self.assertTrue(form.your_other_properties.is_valid())
        self.assertEqual(form.your_other_properties.cleaned_data['other_properties'], False)

    def test_post_subform_partners_income(self):
        # TEST post with full data, simple case
        form = YourFinancesForm(data=self._get_default_post_data())

        self.assertTrue(form.partners_income.is_valid())
        self.assertEqual(form.partners_income.cleaned_data['earnings_per_month'], 100)
        self.assertEqual(form.partners_income.cleaned_data['other_income_per_month'], 100)
        self.assertEqual(form.partners_income.cleaned_data['self_employed'], False)


    def test_post_subform_your_income(self):
        # TEST post with full data, simple case
        form = YourFinancesForm(data=self._get_default_post_data())

        self.assertTrue(form.your_income.is_valid())
        self.assertEqual(form.your_income.cleaned_data['earnings_per_month'], 100)
        self.assertEqual(form.your_income.cleaned_data['other_income_per_month'], 100)
        self.assertEqual(form.your_income.cleaned_data['self_employed'], False)

class YourProblemFormTestCase(CLATestCase):
    def setUp(self):
        super(YourProblemFormTestCase, self).setUp()

        self.mocked_connection.category.get.return_value = mocked_api.CATEGORY_LIST

    def test_get(self):
        form = YourProblemForm()

        choices = form.fields['category'].choices
        self.assertEqual(len(choices), 4)
        self.assertEqual([c[0] for c in choices], [1,2,3,4])
        self.assertEqual(choices[0][1], 'Immigration')  # checking only the first one

    def _get_default_post_data(self):
        return {
            'category': '4',
            'notes': 'lorem'
        }

    def test_post_success_first_time(self):
        """
        The first time we save the form without passing the eligibility reference,
        we call POST to create an object
        """
        data = self._get_default_post_data()
        form = YourProblemForm(data=data)
        self.assertTrue(form.is_valid())

        response = form.save()
        self.mocked_connection.eligibility_check.post.assert_called_with(data)

    def test_post_success_second_time(self):
        """
        The second time we save the form passing the eligibility reference,
        we call PATCH to update an object
        """
        reference = '1234567890'
        data = self._get_default_post_data()
        form = YourProblemForm(reference=reference, data=data)
        self.assertTrue(form.is_valid())

        response = form.save()
        self.mocked_connection.eligibility_check(reference).patch.assert_called_with(data)

    def test_post_validation_errors(self):
        default_data = self._get_default_post_data()

        ERRORS_DATA = [
            # category mandatory
            {
                'error': {'category': [u'This field is required.']},
                'data': { 'category': None }
            },
            # invalid category
            {
                'error': {'category': [u'Select a valid choice. 3333 is not one of the available choices.']},
                'data': { 'category': 3333 }
            },
            # notes too long
            {
                'error': {'notes': [u'Ensure this value has at most 500 characters (it has 501).']},
                'data': { 'notes': 's'*501 }
            },
        ]

        for error_data in ERRORS_DATA:
            data = dict(default_data)
            data.update(error_data['data'])

            form = YourProblemForm(data=data)
            self.assertFalse(form.is_valid())
            self.assertEqual(form.errors, error_data['error'])
