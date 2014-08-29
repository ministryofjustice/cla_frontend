(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe');

  function assert_tabs_shown(num) {
    browser.findElements(by.css('[name="form"] ul.Tabs [ng-repeat="section in sections"]')).then(function (tabs) {
      expect(tabs.length).toBe(num);
    });
  }

  function find_section_tab(title) {
    return browser.isElementPresent(by.cssContainingText('[name="form"] ul.Tabs li', title));
  }

  function set_on_passported_benefits(value) {
    browser.findElement(by.cssContainingText('[name="form"] ul.Tabs a', 'Details')).click();
    var yes_no = value ? '0' : '1';
    $('#id_your_details-passported_benefits_' + yes_no).click();
  }

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    describe('The financial assessment', function() {
      it('should show 4 section tabs', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get('call_centre/' + case_ref + '/');
          browser.findElement(by.css('[ui-sref="case_detail.edit.eligibility"]')).click();
          assert_tabs_shown(4);
        });
      });

      it('should not show income or expenses tabs if on passported benefits', function () {
        set_on_passported_benefits(true);
        assert_tabs_shown(2);
        expect(find_section_tab('Income')).toBe(false);
        expect(find_section_tab('Expenses')).toBe(false);
      });

      it('should show income and expenses if change to on passported benefits', function () {
        set_on_passported_benefits(false);
        assert_tabs_shown(4);
        expect(find_section_tab('Income')).toBe(true);
        expect(find_section_tab('Expenses')).toBe(true);
      });
    });
  });
})();
