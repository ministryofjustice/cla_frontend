(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  describe('Operator Case Suspension', function() {
    beforeEach(utils.setUp);
    
    describe('Suspend a case', function () {
      it('should suspend a case', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          browser.findElement(by.cssContainingText('.CaseDetails-actions button', 'Close')).click();

          var suspend_link = by.cssContainingText('.CaseDetails-actions a', 'Suspend');
          expect(browser.isElementPresent(suspend_link)).toBe(true);
          browser.findElement(suspend_link).click();

          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[type="radio"][value="TERM"]')).click();
          modalEl.findElement(by.css('textarea[name="notes"]')).sendKeys('This case was suspended.');
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);
        });
      });
    });
  });
})();