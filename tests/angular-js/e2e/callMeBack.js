(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  // test vars
  var callMeBackLink = element(by.name('callback'));
  var modal = element(by.css('.CallbackModal-wrapper'));

  describe('callMeBack', function() {
    describe('An operator', function () {
      var cbCaseRef;

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
        expect(browser.getCurrentUrl()).toContain(CONSTANTS.callcentreBaseUrl);
        expect(element(by.cssContainingText('.ListTable td a', cbCaseRef)).isPresent()).toBe(false);

        // reload the case and check that the outcome code is there and that the Notice 'Callback scheduled for ...'
        // is there
        utils.goToCaseDetail(cbCaseRef);
        utils.checkLastOutcome('CBC');
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });

    describe('An operator manager', function () {
      var cbCaseRef;
      var heatmapTable = element(by.css('.CallbackMatrix'));
      var caseList = element(by.css('.ListTable'));

      beforeEach(utils.setUpAsOperatorManager);

      it('should be able to schedule a CB1 for tomorrow', function() {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          cbCaseRef = case_ref;

          assertCBx(1, cbCaseRef, 'Schedule a callback');
        });
      });

      it('should be able to view future callbacks schedule', function() {
        browser.get(CONSTANTS.callcentreBaseUrl);

        element(by.css('[ui-sref="case_list.callbacks"]')).click();

        expect(heatmapTable.isPresent()).toBe(true);
      });

      it('should see the callback for tomorrow in the list', function() {
        var cell = element.all(by.css('.CallbackMatrix .CallbackMatrix-cell')).get(1);
        var caseLink = caseList.element(by.cssContainingText('tbody tr a', cbCaseRef));

        expect(caseList.isDisplayed()).toBe(false);
        cell.element(by.css('a')).click();
        expect(caseList.isDisplayed()).toBe(true);

        expect(caseLink.isPresent()).toBe(true);

        caseLink.click();
        expect(element(by.exactBinding('::case.reference')).getText()).toBe(cbCaseRef);
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
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
    modal.element(by.name('callback_form')).submit();
    expect(modal.isPresent()).toBe(false);

    // check that the case is not in the case list
    expect(browser.getCurrentUrl()).toContain(CONSTANTS.callcentreBaseUrl);
    expect(element(by.cssContainingText('.ListTable td a', caseref)).isPresent()).toBe(false);

    // reload the case and check that the outcome code is there and that the Notice 'Callback scheduled for ...'
    // is there
    utils.goToCaseDetail(caseref);
    utils.checkLastOutcome(expectedCode);
    expect(
      element(by.cssContainingText('callback-status', 'Callback scheduled for')).isPresent()
    ).toBe(true);
  }
})();
