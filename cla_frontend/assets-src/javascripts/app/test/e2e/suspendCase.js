/* jshint undef:false, unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe');

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);
    
    describe('Suspend a case', function () {
      it('should suspend a case', function () {

        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+'/');

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

      function checkOutcomeCode(code) {
        var codeSpan = element.all(by.binding('log.code'));
        expect(codeSpan.get(0).getText()).toEqual(code);
      }
    });
  });
})();