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

    describe('Assign Alternative Help', function () {
      it('should have a disabled assign button if no alternative help providers selected', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+"/");

          clickCloseButton();
          var alternative_help_link = findAlternativeHelpLink();
          expect(browser.isElementPresent(alternative_help_link)).toBe(true);
          browser.findElement(alternative_help_link).click();

          var selected_provider_inputs = browser.findElements(by.css('input[name=selected_providers]:checked'));
          expect(selected_provider_inputs).toEqual([]);

          var submitButton = browser.findElement(by.css('button[name=assign-alternative-help]'));
          expect(submitButton.isEnabled()).toBe(false);
        });
      });


      it('should have enabled assign button if alternative help providers selected', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+"/");

          clickCloseButton();
          var alternative_help_link = findAlternativeHelpLink();
          expect(browser.isElementPresent(alternative_help_link)).toBe(true);
          browser.findElement(alternative_help_link).click();



          var selected_provider_inputs = browser.findElements(by.css('input[name=selected_providers]:checked'));
          expect(selected_provider_inputs).toEqual([]);

          var submitButton = browser.findElement(by.css('button[name=assign-alternative-help]'));
          expect(submitButton.isEnabled()).toBe(false);

          var provider_inputs = browser.findElements(by.css('input[name=selected_providers]')) || [];
          provider_inputs.then(function (data) {
            var to_select;

            // select the first three
            to_select = data.splice(0,3);

            for (var i = 0; i < to_select.length; i++) {
              var inputEl = to_select[i];
              inputEl.click();
            }
          });

          selected_provider_inputs = browser.findElements(by.css('input[name=selected_providers]:checked'));
          selected_provider_inputs.then(function (data) {
            expect(data.length).toBe(3);
          });
          expect(submitButton.isEnabled()).toBe(true);
        });
      });


      it('should assign', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+"/");

          clickCloseButton();
          var alternative_help_link = findAlternativeHelpLink();
          browser.findElement(alternative_help_link).click();


          var provider_inputs = browser.findElements(by.css('input[name="selected_providers"]')) || [];
          provider_inputs.then(function (data) {
            var to_select;

            // select the first three
            to_select = data.splice(0,3);

            for (var i = 0; i < to_select.length; i++) {
              var inputEl = to_select[i];
              inputEl.click();
            }
          });

          var submitButton = browser.findElement(by.css('button[name="assign-alternative-help"]'));
          browser.getCurrentUrl().then(function (caseUrl) {
            submitButton.sendKeys(protractor.Key.ENTER);
            browser.waitForAngular();
            browser.get(caseUrl);
            checkOutcomeCode('IRKB');
          });
        });

      });



      // xit-ing for now as it causes problems
      xit('should assign f2f', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+"/");

          clickCloseButton();
          var alternative_help_link = findAlternativeHelpLink();
          browser.findElement(alternative_help_link).click();

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
          browser.get('call_centre/' + case_ref + "/");

          clickCloseButton();

          var alternative_help_link = findAlternativeHelpLink();
          browser.findElement(alternative_help_link).click();
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
          browser.get('call_centre/' + case_ref + "/");

          clickCloseButton();

          var alternative_help_link = findAlternativeHelpLink();
          browser.findElement(alternative_help_link).click();
          var submitButton = browser.findElement(by.cssContainingText('button.Button.Button--secondary', 'User declines all help / no appropriate help found'));
          expect(submitButton.isEnabled()).toBe(true);
          submitButton.click();

          expect(browser.isElementPresent(by.css('div.modal'))).toBe(true);

          expect(element.all(by.css('div.modal h2')).get(0).getText()).toBe('Exceptional Case Fund');
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

      function clickCloseButton() {
        return browser.findElement(by.css('.CaseDetails-actions button[name="close-case"]')).click();
      }

      function findAlternativeHelpLink(){
        return by.css('a[ui-sref="case_detail.alternative_help"]');
      }

    });


  });
})();
