/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils'), // UTILS
      modelsRecipe = require('./_modelsRecipe');

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('The financial assessment', function() {

      it('should show 4 section tabs', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get('call_centre/'+case_ref+'/');
          go_to_means_test();
          assert_all_tabs_shown();
        });
      });

      it('should not show income or expenses tabs if on passported benefits', function () {
        modelsRecipe.Case.createWithPartialMeansTest().then(function (case_ref) {
          browser.get('call_centre/'+case_ref+'/');
          go_to_means_test();
          assert_income_and_expenses_hidden();
        });
      });

      it('should toggle visibility of income and expenses tabs when passported benefits selected', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get('call_centre/'+case_ref+'/');
          go_to_means_test();
          assert_all_tabs_shown();
          set_on_passported_benefits(true);
          assert_income_and_expenses_hidden();
          set_on_passported_benefits(false);
          assert_all_tabs_shown();
        });
      });

      function go_to_means_test() {
        browser.findElement(by.css('[ui-sref="case_detail.edit.eligibility"]')).click();
      }

      function assert_all_tabs_shown() {
        get_section_tabs().then(function (tabs) {
          expect(tabs.length).toBe(4);
        });
      }

      function assert_income_and_expenses_hidden() {
        get_section_tabs().then(function (tabs) {
          expect(tabs.length).toBe(2);
          expect(find_section_tab('Income')).toBe(false);
          expect(find_section_tab('Expenses')).toBe(false);
        });
      }

      function get_section_tabs() {
        return browser.findElements(by.css('[name="form"] ul.Tabs [ng-repeat="section in sections"]'));
      }

      function find_section_tab(title) {
        return browser.isElementPresent(by.cssContainingText('[name="form"] ul.Tabs li', title));
      }

      function set_on_passported_benefits(value) {
        show_details_section();
        var yes_no = value ? '0' : '1';
        $('#id_your_details-passported_benefits_' + yes_no).click();
      }

      function show_details_section() {
        browser.findElement(by.cssContainingText('[name="form"] ul.Tabs a', 'Details')).click();
      }

    });
  });
})();
