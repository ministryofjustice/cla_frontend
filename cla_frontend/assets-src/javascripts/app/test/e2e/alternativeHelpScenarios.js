/* jshint undef:false, unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils');

  xdescribe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('Assign Alternative Help', function () {
      it('should have a disabled assign button if no alternative help providers selected', function () {
        utils.createCase();
        clickCloseButton();
        var alternative_help_link = findAlternativeHelpLink();
        expect(browser.isElementPresent(alternative_help_link)).toBe(true);
        browser.findElement(alternative_help_link).click();

        var selected_provider_inputs = browser.findElements(by.css('input[name=selected_providers]:checked'));
        expect(selected_provider_inputs).toEqual([]);

        var submitButton = browser.findElement(by.css('button[name=assign-alternative-help]'));
        expect(submitButton.isEnabled()).toBe(false);

      });


      it('should have enabled assign button if alternative help providers selected', function () {
        utils.createCase();
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


      it('should assign', function () {
        utils.createCase();
        clickCloseButton();
        var alternative_help_link = findAlternativeHelpLink();
        browser.findElement(alternative_help_link).click();


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

        var submitButton = browser.findElement(by.css('button[name=assign-alternative-help]'));
        browser.getCurrentUrl().then(function (caseUrl) {
          submitButton.click();
          browser.get(caseUrl);
          checkOutcomeCode('IRKB');
        });

      });



      // xit-ing for now as it causes problems
      xit('should assign f2f', function () {
        utils.createCase();
        clickCloseButton();
        var alternative_help_link = findAlternativeHelpLink();
        browser.findElement(alternative_help_link).click();

        var origWindow = browser.getWindowHandle();

        browser.findElement(
          by.css('a[href="http://find-legal-advice.justice.gov.uk/"]')
        ).click().then(function () {

            browser.switchTo().window(origWindow);
          });



        var submitButton = browser.findElement(by.css('button[name=assign-f2f]'));
        expect(submitButton.isEnabled()).toBe(false);

        browser.findElement(by.css('textarea[name="notes"]')).sendKeys('test');
        expect(submitButton.isEnabled()).toBe(true);

        browser.getCurrentUrl().then(function (caseUrl) {
          submitButton.click();
          browser.get(caseUrl);
          checkOutcomeCode('COSPF');
        });

      });

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
