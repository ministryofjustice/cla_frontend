/* global xit */
(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    describe('Assign Alternative Help', function () {
      var caseRef;
      var selectProviders = element.all(by.css('input[name=selected_providers]:checked'));
      var assignSubmit = element(by.name('assign-alternative-help'));
      var modal = element(by.css('.modal-content'));


      it('should not be able to assign without diagnosis', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
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
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(_caseRef) {
          caseRef = _caseRef;

          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + '/');

          gotoAltHelp();

          expect(selectProviders.count()).toBe(0);
          expect(assignSubmit.isEnabled()).toBe(false);
        });
      });


      it('should have enabled assign button if alternative help providers selected', function () {
        var provider_inputs = browser.findElements(by.css('input[name=selected_providers]')) || [];
        provider_inputs.then(function (data) {
          // select the first three
          var to_select = data.splice(0,3);

          for (var i = 0; i < to_select.length; i+=1) {
            var inputEl = to_select[i];
            inputEl.click();
          }
        });

        expect(selectProviders.count()).toBe(3);
        expect(assignSubmit.isEnabled()).toBe(true);
      });


      it('should assign', function () {
        assignSubmit.click();
        browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');
        checkOutcomeCode('IRKB');
      });


      // xit-ing for now as it causes problems
      xit('should assign f2f', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          var origWindow = browser.getWindowHandle();

          browser.findElement(
            by.css('a[href="http://find-legal-advice.justice.gov.uk/"]')
          ).click().then(function () {

              browser.switchTo().window(origWindow);
            });

          var submitButton = browser.findElement(by.css('button[name="assign-f2f"]'));
          expect(submitButton.isEnabled()).toBe(false);

          browser.findElement(by.css('textarea[name="notes"]')).sendKeys('test');
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

        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          var submitButton = browser.findElement(by.cssContainingText('button.Button.Button--secondary', 'User declines all help / no appropriate help found'));
          expect(submitButton.isEnabled()).toBe(true);
          submitButton.click();

          expect(browser.isElementPresent(by.css('div.modal'))).toBe(true);

          declineHelp();
          expect(browser.isElementPresent(by.css('div.modal button[type="submit"]'))).toBe(true);

          browser.getCurrentUrl().then(function (caseUrl) {
            browser.findElement(by.css('div.modal button[type="submit"]')).submit();
            browser.get(caseUrl);
            checkOutcomeCode('DECL');
          });
        });
      });


      //      An in-scope / eligible case shouldn't see ECF message;
      it('should be able to decline help (out_scope) & should see ECF message', function () {
        modelsRecipe.Case.createWithOutScopeAndInEligible().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          gotoAltHelp();

          var submitButton = browser.findElement(by.cssContainingText('button.Button.Button--secondary', 'User declines all help / no appropriate help found'));
          expect(submitButton.isEnabled()).toBe(true);
          submitButton.click();

          expect(browser.isElementPresent(by.css('div.modal'))).toBe(true);

          expect(element.all(by.css('div.modal h2')).get(0).getText()).toBe('Exceptional case funding');
          pickECFStatement();

          declineHelp();
          browser.getCurrentUrl().then(function (caseUrl) {
            browser.findElement(by.css('div.modal button[type="submit"]')).click();
            browser.waitForAngular();
            browser.get(caseUrl);
            checkOutcomeCode('DECL');
          });
        });
      });

      function pickECFStatement() {
        browser.findElement(by.css('input[name="ecf_statement"][value="CLIENT_TERMINATED"]:first-child')).click();
        browser.findElement(by.css('div.modal button[type="submit"]')).submit();
        browser.waitForAngular();
      }

      function declineHelp() {
        expect(element.all(by.css('div.modal h2')).get(0).getText()).toBe('Decline Help');
        expect(browser.isElementPresent(by.repeater('code in codes'))).toBe(true);
        browser.findElement(by.css('input[name="code"][value="DECL"]:first-child')).click();
      }

      function checkOutcomeCode(code) {
        var codeSpan = element.all(by.binding('log.code'));
        expect(codeSpan.get(0).getText()).toEqual(code);
      }

      function gotoAltHelp() {
        browser.findElement(by.css('.CaseDetails-actions button[name="close-case"]')).click();
        browser.findElement(by.css('#alternative_help')).click();
      }
    });
  });
})();
