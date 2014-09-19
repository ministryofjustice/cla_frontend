/* jshint unused:false, quotmark:false */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    describe('Case Set Matter Types and Assign', function() {

      /**
       * Go to the assign page; if an option as_of parameter is given, it
       * will reload the page in 'mocked-time' mode.
       * If you are using this 'mocked-time' mode then make sure you
       * have set the matter types first.
       *
       * @param as_of datetime string in format (iso) yyyy-mm-ddThh:mm
       * @returns {!webdriver.promise.Promise.<void>}
       */
      function goto_assign(as_of) {
        utils.scrollTo(browser.findElement(by.css('.CaseDetails-actions')));
        browser.findElement(by.css('.CaseDetails-actions button[name="close-case"]')).click();
        var clicked = browser.findElement(by.css('.CaseDetails-actions button[name="close--assign-provider"]')).click();

        if (as_of) {
          browser.getLocationAbsUrl().then(function(url) {
            return browser.get(url+'?as_of='+encodeURIComponent(as_of));
          });
        }
        return clicked;
      }

      function checkAssign(case_ref) {
        var txt = browser.findElement(by.css('.Notice.success')).getInnerHtml();
        expect(txt).toContain('Case '+case_ref+' assigned to');
      }

      function assignAnyProvider() {
        browser.findElements(by.css('[name=provider]')).then(function (elements) {
          elements[0].click();
        });
      }

      it('should not allow assigning without diagnosis or eligibility', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();


          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          browser.findElement(by.css('.Notice.error')).getInnerHtml().then(function(el) {
            expect(el).toBe('The Case must be in scope and eligible to be assigned.');
          });
        });
      });

      it('should not allow assigning a case without required fields', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          var messages = element(by.css('.modal-content .Error[data-case-errors]'));
          expect(messages.isPresent()).toBe(true);
          expect(messages.getText()).toContain('Name');
          expect(messages.getText()).toContain('Case notes');
          expect(messages.getText()).toContain('A media code');
          expect(messages.getText()).toContain('Date of birth');
          expect(messages.getText()).toContain('A contact number');
        });
      });

      it('should give a warning when assigning a case without address fields', function () {
        modelsRecipe.Case.createWithRequiredFields().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          var messages = element(by.css('.modal-content .Notice[data-case-warnings]'));
          expect(messages.isPresent()).toBe(true);
          expect(messages.getText()).toContain('postcode');
          expect(messages.getText()).toContain('address');
          expect(messages.getText()).toContain('National Insurance number');
        });

      });


      it('should show modal when trying to assign without matter types set', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
        });
      });

      it('should not allow saving modal without setting matter type 1 and 2', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(modalEl.isElementPresent(by.css('button[type="submit"]'))).toBe(true);
        });
      });


      it('should allow saving modal after setting matter type 1 and 2', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);
        });
      });

      it('should go straight to assign page if MT1 and MT2 are already set', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');

          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          var assignCaseUrl;
          browser.getLocationAbsUrl().then(function (url) {
            assignCaseUrl = url;
          });
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');
          goto_assign();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);
          browser.getLocationAbsUrl().then(function (url) {
            expect(url).toBe(assignCaseUrl);
          });
        });
      });

      it('should assign a case to recommended provider (inside office hours)', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          goto_assign('2014-08-06T11:50');

          browser.findElement(by.css('button[name="assign-provider"]')).click();

          checkAssign(case_ref);
        });
      });


      it('should assign case to rota provider (outside office hours)', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          goto_assign('2014-08-06T19:50');
          browser.findElement(by.css('button[name="assign-provider"]')).click();

          checkAssign(case_ref);
        });
      });


      it('should assign case outside office hours without rota set', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          goto_assign('2014-08-01T19:30');
          expect(browser.findElement(by.css('button[name="assign-provider"]')).isEnabled()).toBe(false);
          browser.findElements(by.repeater('provider in suggested_providers | filter:provider_search')).then(function(providers){
            providers[0].findElement(by.css('input[name="provider"]')).click();
          });

          expect(browser.findElement(by.css('button[name="assign-provider"]')).isEnabled()).toBe(true);
          browser.findElement(by.css('button[name="assign-provider"]')).click();
          checkAssign(case_ref);
        });
      });
    });
  });
})();
