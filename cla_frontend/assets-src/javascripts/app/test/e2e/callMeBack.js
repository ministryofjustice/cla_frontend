(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  // test vars
  var cbCaseRef;
  var callMeBackLink = element(by.name('callback'));
  var modal = element(by.css('.CallbackModal'));

  describe('callMeBack', function() {
    beforeEach(utils.setUp);

    it('should be able to suspend a case with a CB1 code', function() {
      modelsRecipe.Case.createEmpty().then(function(case_ref) {
        cbCaseRef = case_ref;

        assertCBx(1, cbCaseRef, 'Schedule a callback');
      });
    });

    it('should allow stopping a callback', function() {
      // stop callback
      element(by.cssContainingText('callback-status a', 'Remove callback')).click();
      browser.switchTo().alert().accept();

      // notice box disappears
      expect(
        element(by.cssContainingText('callback-status', 'Callback scheduled for')).isPresent()
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

      expect(callMeBackLink.isPresent()).toBe(true);
      callMeBackLink.click();

      // check modal header and buttons
      expect(modal.element(by.css('header')).getText()).toBe('Cancel callback');
      expect(
        modal.element(by.cssContainingText('div.modal button', 'Save')).isPresent()
      ).toBe(false);
      expect(
        modal.element(by.cssContainingText('button', 'Stop callback')).isPresent()
      ).toBe(true);

      element(by.cssContainingText('button', 'Stop callback')).click();
      browser.switchTo().alert().accept();
      expect(modal.isPresent()).toBe(false);

      // check that the case is not in the case list
      expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);
      expect(element(by.cssContainingText('.ListTable td a', cbCaseRef)).isPresent()).toBe(false);

      // reload the case and check that the outcome code is there and that the Notice 'Callback scheduled for ...'
      // is there
      utils.goToCaseDetail(cbCaseRef);
      expect(element.all(by.css('.CaseHistory-label:first-child')).get(0).getText()).toBe('CBC');
    });
  });

  // test helpers
  function assertCBx(attemptNum, caseref, expectedScheduleTitle) {
    var expectedCode = 'CB' + attemptNum;

    utils.goToCaseDetail(caseref);

    expect(callMeBackLink.isPresent()).toBe(true);
    callMeBackLink.click();

    // check modal header and buttons
    expect(modal.element(by.css('header')).getText()).toBe(expectedScheduleTitle);
    expect(
      modal.element(by.cssContainingText('button', 'Stop callback')).isPresent()
    ).toBe(attemptNum === 1 ? false : true);

    // fill in the modal form and submit
    modal.element(by.name('set-tomorrow')).click();
    modal.element(by.name('callbackNotes')).sendKeys(expectedCode + ' scheduled.');
    modal.element(by.css('button[type="submit"]')).click();
    expect(modal.isPresent()).toBe(false);

    // check that the case is not in the case list
    expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);
    expect(element(by.cssContainingText('.ListTable td a', cbCaseRef)).isPresent()).toBe(false);

    // reload the case and check that the outcome code is there and that the Notice 'Callback scheduled for ...'
    // is there
    utils.goToCaseDetail(caseref);
    expect(element.all(by.css('.CaseHistory-label:first-child')).get(0).getText()).toBe(expectedCode);
    expect(
      element(by.cssContainingText('callback-status', 'Callback scheduled for')).isPresent()
    ).toBe(true);
  }
})();
