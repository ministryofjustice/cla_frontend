(function () {
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  describe('meansTest', function () {
    beforeEach(utils.setUp);

    describe('Operator financial assessment', function () {
      it('should show 4 section tabs', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');
          element(by.css('[ui-sref="case_detail.edit.eligibility"]')).click();
          assertTabsShown(4);
        });
      });

      it('should not show income or expenses tabs if on passported benefits', function () {
        setPassported(true);
        assertTabsShown(2);
        expect(getTab('Income', 2).isPresent()).toBe(false);
        expect(getTab('Expenses', 2).isPresent()).toBe(false);
      });

      it('should show income and expenses if change to on passported benefits', function () {
        setPassported(false);
        assertTabsShown(4);
        expect(getTab('Income', 2).isPresent()).toBe(true);
        expect(getTab('Expenses', 2).isPresent()).toBe(true);
      });

      it('should not be allowed when not in scope', function () {
        modelsRecipe.Case.createWithScopeAndEligibility(false).then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');
          var tab = getTab('Finances');

          // check is disabled
          expect(tab.getAttribute('class')).toContain('is-disabled');
          tab.element(by.css('a')).click();
          // check has been redirected and message displayed
          expect(browser.getLocationAbsUrl()).toContain(caseRef + '/diagnosis/');
          expect(element(by.repeater('m in messages').row(0)).getText()).toContain('You must complete an in scope diagnosis before completing the financial assessment');
        });
      });

      it('should be allowed when no/out of scope but has assessment', function () {
        modelsRecipe.Case.createRecipe({}, {}, {}, CONSTANTS.eligibility.true).then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');
          var tab = getTab('Finances');

          // check is not disabled
          expect(tab.getAttribute('class')).not.toContain('is-disabled');
          tab.element(by.css('a')).click();

          expect(browser.getLocationAbsUrl()).toContain(caseRef + '/eligibility/');
        });
      });
    });
  });

  // helpers
  function assertTabsShown (num) {
    element.all(by.css('ul [ng-repeat="section in sections"]')).then(function (tabs) {
      expect(tabs.length).toBe(num);
    });
  }

  function getTab (title, level) {
    var selector = level > 1 ? '.Pills-pill' : '.Tabs-tab';
    return element(by.cssContainingText(selector, title));
  }

  function setPassported (value) {
    var detailsTab = getTab('Details', 2);
    var yes_no = value ? '0' : '1';
    utils.scrollTo(element(by.name('case.notes'))); // firefox fix!
    detailsTab.element(by.css('a')).click();
    element(by.id('id_your_details-passported_benefits_' + yes_no)).click();
  }
})();
