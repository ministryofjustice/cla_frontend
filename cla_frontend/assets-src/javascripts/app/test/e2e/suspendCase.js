(function () {
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  // test vars
  var caseRef;
  var modalEl = element(by.css('div.modal'));
  var modalHeader = modalEl.element(by.css('header'));
  var suspend_link = element(by.css('.CaseBar-actions a[ui-sref="case_detail.suspend"]'));

  describe('suspendCase', function () {
    beforeEach(utils.setUp);

    describe('An operator suspending a case', function () {
      it('should be warned about missing fields', function () {
        modelsRecipe.Case.createEmpty().then(function (_caseRef) {
          caseRef = _caseRef;

          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');

          gotoSuspend();

          expect(modalEl.isPresent()).toBe(true);
          expect(modalHeader.getText()).toContain('Missing client information');
        });
      });

      it('should not suspend after cancelling modal', function () {
        modalEl.element(by.name('modal-cancel')).click();
        expect(modalEl.isPresent()).toBe(false);
        expect(browser.getLocationAbsUrl()).not.toContain('suspend');
      });

      it('should be able to proceed to suspend after accepting modal', function () {
        gotoSuspend();

        modalEl.element(by.name('modal-confirm')).click();
        expect(modalEl.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain('suspend');
        expect(modalHeader.getText()).toContain('Suspend case');
      });

      it('should suspend a case', function () {
        suspendCase(caseRef);
      });

      it('should suspend a completed case without confirmation', function () {
        modelsRecipe.Case.createWithRequiredFields().then(function (_caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + '/');

          gotoSuspend();

          expect(modalEl.isPresent()).toBe(true);
          expect(browser.getLocationAbsUrl()).toContain('suspend');
          expect(modalHeader.getText()).toContain('Suspend case');

          suspendCase(_caseRef);
        });
      });
    });
  });

  // helpers
  function gotoSuspend () {
    suspend_link.click();
  }

  function suspendCase (reference) {
    modalEl.element(by.css('input[type="radio"][value="TERM"]')).click();
    modalEl.element(by.css('textarea[name="notes"]')).sendKeys('This case was suspended.');
    modalEl.element(by.css('button[type="submit"]')).click();
    expect(modalEl.isPresent()).toBe(false);
    expect(browser.getLocationAbsUrl()).not.toContain(reference);
  }
})();
