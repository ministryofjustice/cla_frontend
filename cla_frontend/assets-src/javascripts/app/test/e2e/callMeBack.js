(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  describe('As Operator', function() {
    beforeEach(utils.setUp);

      var cb1CaseRef;

      it('should be able to suspend a case with a CB1 code', function() {

        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          cb1CaseRef = case_ref;

          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          browser.findElement(by.cssContainingText('.CaseDetails-actions button', 'Close')).click();

          var call_me_back_link = by.cssContainingText('.CaseDetails-actions a', 'Callback');
          expect(browser.isElementPresent(call_me_back_link)).toBe(true);
          browser.findElement(call_me_back_link).click();

          var modalEl = browser.findElement(by.css('div.modal'));

          // the default value is already now + 15 minutes
          // modalEl.findElement(by.css('input[name="datetime"]')).sendKeys('03-10-2020');
          modalEl.findElement(by.css('textarea[name="notes"]')).sendKeys('CB1 scheduled.');
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);


          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');
          expect(element.all(by.css('.CaseHistory-label:first-child')).get(0).getText()).toBe('CB1');
        });
      });

      it('should not show CB1 cases in the case list queue', function() {
        browser.get(CONSTANTS.callcentreBaseUrl);

        expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);

        expect(browser.isElementPresent(by.cssContainingText('.ListTable td a', cb1CaseRef))).toBe(false);
      });
  });
})();
