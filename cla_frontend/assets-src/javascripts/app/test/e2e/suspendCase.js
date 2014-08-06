'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

var protractor = require('protractor');

// UTILS
var utils = require('./_utils');

describe('operatorApp', function() {
  // logs the user in before each test
  beforeEach(utils.setUp);

  describe('Suspend a case', function () {
    it('should suspend a case', function () {

      utils.createCase().then(function(_case) {
        var caseNum = _case;

        clickCloseButton();

        var suspend_link = findSuspendLink();
        expect(browser.isElementPresent(suspend_link)).toBe(true);
        browser.findElement(suspend_link).click();

        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css("input[type='radio'][value='TERM']")).click();
        modalEl.findElement(by.css("textarea[name='notes']")).sendKeys('This case was suspended.');
        modalEl.findElement(by.css("button[type='submit']")).click();
        expect(browser.isElementPresent(by.css("div.modal"))).toBe(false);

        utils.getCase(caseNum);

        checkOutcomeCode('TERM');
      });
    });

    function checkOutcomeCode(code) {
      var codeSpan = element.all(by.binding('log.code'));
      expect(codeSpan.get(0).getText()).toEqual(code);
    }

    function clickCloseButton() {
      return browser.findElement(by.css('.CaseDetails-actions button')).click();
    }

    function findSuspendLink(){
      return by.cssContainingText(".CaseDetails-actions a", "Suspend");
    }
  });
});
