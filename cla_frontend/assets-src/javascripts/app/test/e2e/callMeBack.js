(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  describe('As Operator', function() {
    beforeEach(utils.setUp);

      var cbCaseRef;

      function assertCBx(attemptNum, caseref, expectedScheduleTitle) {
        var expectedCode = 'CB'+attemptNum;

        utils.goToCaseDetail(caseref);

        browser.findElement(by.cssContainingText('.CaseDetails-actions button', 'Close')).click();

        var callMeBackLink = by.cssContainingText('.CaseDetails-actions a', 'Callback');
        expect(browser.isElementPresent(callMeBackLink)).toBe(true);
        browser.findElement(callMeBackLink).click();

        var modalEl = browser.findElement(by.css('div.modal'));

        // check modal header and buttons
        expect(modalEl.findElement(by.css('header')).getText()).toBe(expectedScheduleTitle);
        expect(
          browser.isElementPresent(by.cssContainingText('button', 'Cancel callback'))
        ).toBe(attemptNum === 1 ? false : true);

        // fill in the modal form and submit
        modalEl.findElement(by.css('input[name="datetime"]')).sendKeys('08/10/2020 11:00');
        modalEl.findElement(by.css('textarea[name="notes"]')).sendKeys(expectedCode+' scheduled.');
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

        // check that the case is not in the case list
        expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);
        expect(browser.isElementPresent(by.cssContainingText('.ListTable td a', cbCaseRef))).toBe(false);

        // reload the case and check that the outcome code is there and that the Notice 'Callback scheduled for ...'
        // is there
        utils.goToCaseDetail(caseref);
        expect(element.all(by.css('.CaseHistory-label:first-child')).get(0).getText()).toBe(expectedCode);
        expect(
          browser.isElementPresent(by.cssContainingText('.CaseDetails .Notice', 'Callback scheduled for'))
        ).toBe(true);
      }

      it('should be able to suspend a case with a CB1 code', function() {

        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          cbCaseRef = case_ref;

          assertCBx(1, cbCaseRef, 'Schedule a callback');
        });
      });

      it('should allow stopping a callback', function() {
        // stop callback
        element(by.cssContainingText('.CaseDetails .Notice button', 'Stop callback')).click();
        browser.switchTo().alert().accept();

        // notice box disappears
        expect(
          browser.isElementPresent(by.cssContainingText('.CaseDetails .Notice', 'Callback scheduled for'))
        ).toBe(false);

        // reschedule callback, should get a CB1
        assertCBx(1, cbCaseRef, 'Schedule a callback');
      });

      it('should be able to reschedule a callback with a CB2 code', function() {
        assertCBx(2, cbCaseRef, 'Schedule a new callback');
      });

      it('should be able to reschedule a callback with a CB3 code', function() {
        assertCBx(3, cbCaseRef, 'Schedule final callback');
      });

      it('should only allow cancelling a callback after a CB3', function() {
        utils.goToCaseDetail(cbCaseRef);
        browser.findElement(by.cssContainingText('.CaseDetails-actions button', 'Close')).click();

        var callMeBackLink = by.cssContainingText('.CaseDetails-actions a', 'Callback');
        expect(browser.isElementPresent(callMeBackLink)).toBe(true);
        browser.findElement(callMeBackLink).click();

        var modalEl = browser.findElement(by.css('div.modal'));

        // check modal header and buttons
        expect(modalEl.findElement(by.css('header')).getText()).toBe('Cancel callback');
        expect(
          browser.isElementPresent(by.cssContainingText('div.modal button', 'Save'))
        ).toBe(false);
        expect(
          browser.isElementPresent(by.cssContainingText('button', 'Cancel callback'))
        ).toBe(true);

        element(by.cssContainingText('button', 'Cancel callback')).click();
        browser.switchTo().alert().accept();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

        // check that the case is not in the case list
        expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);
        expect(browser.isElementPresent(by.cssContainingText('.ListTable td a', cbCaseRef))).toBe(false);

        // reload the case and check that the outcome code is there and that the Notice 'Callback scheduled for ...'
        // is there
        utils.goToCaseDetail(cbCaseRef);
        expect(element.all(by.css('.CaseHistory-label:first-child')).get(0).getText()).toBe('CBC');
      });
  });
})();
