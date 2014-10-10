/* global xit */
(function () {
  'use strict';

  var utils = require('./_utils');
  var modelsRecipe = require('./_modelsRecipe');
  var CONSTANTS = require('../protractor.constants');

  var providers = element.all(by.css('input[name=selected_providers]'));
  var selectedProviders = element.all(by.css('input[name=selected_providers]:checked'));
  var assignSubmit = element(by.name('assign-alternative-help'));
  var assignF2fBtn = element(by.name('assign-f2f'));
  var declineBtn = element(by.name('decline-help'));
  var modal = element(by.css('.modal-content'));
  var modalHeading = modal.element(by.css('h2'));
  var modalSubmit = modal.element(by.css('button[type="submit"]'));

  describe('alternativeHelp', function () {
    beforeEach(utils.setUp);

    describe('An operator', function () {
      it('should not be able to assign without diagnosis', function () {
        modelsRecipe.Case.createEmpty().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          expect(modal.isPresent()).toBe(true);
          expect(modal.getText()).toContain('Cannot assign alternative help without setting area of law. Please complete diagnosis.');
        });
      });


      it('should not be able to assign without minimum personal details', function () {
        expect(modal.isPresent()).toBe(true);
        expect(modal.getText()).toContain('You must collect at least a name and a postcode or phone number from the client before assigning alternative help.');
      });


      it('should have a disabled assign button if no alternative help providers selected', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (_caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + '/');

          gotoAltHelp();

          expect(selectedProviders.count()).toBe(0);
          expect(assignSubmit.isEnabled()).toBe(false);
        });
      });


      it('should have enabled assign button if alternative help providers selected', function () {
        // var provider_inputs = browser.findElements(by.css('input[name=selected_providers]')) || [];
        providers.then(function (data) {
          // select the first three
          var to_select = data.splice(0,3);

          for (var i = 0; i < to_select.length; i+=1) {
            var inputEl = to_select[i];
            inputEl.click();
          }
        });

        expect(selectedProviders.count()).toBe(3);
        expect(assignSubmit.isEnabled()).toBe(true);
      });


      it('should assign', function () {
        browser.getCurrentUrl().then(function (caseUrl) {
          assignSubmit.click();
          browser.get(caseUrl);
          checkOutcomeCode('IRKB');
        });
      });


      // xit-ing for now as it causes problems
      xit('should assign f2f', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          var origWindow = browser.getWindowHandle();
          var f2fLink = element(by.css('a[href="http://find-legal-advice.justice.gov.uk/"]'));

          f2fLink.click().then(function () {
            browser.switchTo().window(origWindow);
          });

          expect(assignF2fBtn.isEnabled()).toBe(false);

          element(by.name('notes')).sendKeys('test');
          expect(submitButton.isEnabled()).toBe(true);

          browser.getCurrentUrl().then(function (caseUrl) {
            submitButton.click();
            browser.get(caseUrl);
            checkOutcomeCode('COSPF');
          });
        });
      });


      //      An in-scope / eligible case shouldn't see ECF message;
      it('should be able to decline help (in_scope)', function () {

        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          expect(declineBtn.isEnabled()).toBe(true);
          declineBtn.click();

          expect(modal.isPresent()).toBe(true);

          declineHelp();
          expect(modalSubmit.isPresent()).toBe(true);

          browser.getCurrentUrl().then(function (caseUrl) {
            modalSubmit.click();
            browser.get(caseUrl);
            checkOutcomeCode('DECL');
          });
        });
      });


      //      An in-scope / eligible case shouldn't see ECF message;
      it('should be able to decline help (out_scope) & should see ECF message', function () {
        modelsRecipe.Case.createWithOutScopeAndInEligible().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          expect(declineBtn.isEnabled()).toBe(true);
          declineBtn.click();

          expect(modal.isPresent()).toBe(true);

          expect(element.all(by.css('div.modal h2')).get(0).getText()).toBe('Exceptional case funding');
          pickECFStatement();

          declineHelp();
          browser.getCurrentUrl().then(function (caseUrl) {
            modalSubmit.click();
            browser.waitForAngular();
            browser.get(caseUrl);
            checkOutcomeCode('DECL');
          });
        });
      });
    });
  });

  // helpers
  function pickECFStatement () {
    element(by.css('input[name="ecf_statement"][value="CLIENT_TERMINATED"]')).click();
    modalSubmit.click();
    browser.waitForAngular();
  }

  function declineHelp () {
    expect(modalHeading.getText()).toBe('Decline Help');
    expect(element(by.repeater('code in codes')).isPresent()).toBe(true);
    element(by.css('input[name="code"][value="DECL"]')).click();
  }

  function checkOutcomeCode (code) {
    var codeSpan = element.all(by.binding('log.code')).get(0);
    expect(codeSpan.getText()).toEqual(code);
  }

  function gotoAltHelp () {
    element(by.css('.CaseDetails-actions button[name="close-case"]')).click();
    element(by.css('#alternative_help')).click();
  }
})();
