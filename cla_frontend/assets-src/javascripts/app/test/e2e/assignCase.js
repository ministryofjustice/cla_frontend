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
        var txt = browser.findElement(by.css('.Notice.success:last-child')).getInnerHtml();
        expect(txt).toContain('Case '+case_ref+' assigned to');
      }

      function assignAnyProvider() {
        browser.findElements(by.css('[name=provider]')).then(function (elements) {
          elements[0].click();
        });
      }

      it('should allow assigning a case only after all mandatory steps', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          var messages, modalEl;

          // **** TEST 1 ****
          // should not allow assigning a case without required fields
          utils.goToCase(case_ref, true);

          goto_assign();

          messages = element(by.css('.modal-content .Error[data-case-errors]'));
          expect(messages.isPresent()).toBe(true);
          expect(messages.getText()).toContain('Name');
          expect(messages.getText()).toContain('Case notes');
          expect(messages.getText()).toContain('A media code');
          expect(messages.getText()).toContain('Date of birth');
          expect(messages.getText()).toContain('A contact number');

          // post test 1 : filling in required fields
          element(by.css('.modal-content a[ng-click="close()"]')).click();  // closing modal
          utils.showPersonalDetailsForm();
          utils.enterPersonalDetails({
            'full_name': 'Foo Bar Quux',
            'mobile_phone': '0123456789',
            'dob_day': '01',
            'dob_month': '01',
            'dob_year': '2000',
            'media_code': 'Age Concern'
          });
          utils.saveCase();
          utils.setCaseNotes('Notes');


          // **** TEST 2 ****
          // should give a warning when assigning a case without address fields

          goto_assign();

          messages = element(by.css('.modal-content .Notice[data-case-warnings]'));
          expect(messages.isPresent()).toBe(true);
          expect(messages.getText()).toContain('postcode');
          expect(messages.getText()).toContain('address');
          expect(messages.getText()).toContain('National Insurance number');

          // post test 2 : filling in recommended fields
          element(by.css('.modal-content a[ng-click="close()"]')).click();  // closing modal
          utils.showPersonalDetailsForm();
          utils.enterPersonalDetails({
            'postcode': 'F00 B4R',
            'street': '1 Foo Bar',
            'ni_number': 'nin'
          });
          utils.saveCase();

          // **** TEST 3 ****
          // should not allow saving modal without setting matter type 1 and 2
          goto_assign();

          modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(modalEl.isElementPresent(by.css('button[type="submit"]'))).toBe(true);


          // **** TEST 4 ****
          // should allow saving modal after setting matter type 1 and 2

          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          // **** TEST 5 ****
          // should not allow assigning without diagnosis being IN SCOPE

          browser.findElement(by.css('.Notice.error')).getInnerHtml().then(function(el) {
            expect(el).toBe('The Case must be in scope and eligible to be assigned.');
          });

          // post test 5 : completing diagnosis
          element(by.css('.Notice.error')).click();  // closing Notice

          utils.in_scope();


          // **** TEST 6 ****
          // should not allow assigning without eligibility being TRUE

          goto_assign();

          browser.findElement(by.css('.Notice.error')).getInnerHtml().then(function(el) {
            expect(el).toBe('The Case must be in scope and eligible to be assigned.');
          });

          // post test 6 : completing eligibility
          element(by.css('.Notice.error')).click();  // closing Notice

          utils.eligible();


          // **** TEST 7 ****
          // should go straight to assign page when everything is set
          goto_assign();

          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);
          browser.getLocationAbsUrl().then(function (url) {
            utils.expectUrl(url, utils.APP_BASE_URL + case_ref + '/assign/');
          });

        });
      });


      it('should assign a case to recommended provider (inside office hours)', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          utils.goToCase(case_ref);

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
          utils.goToCase(case_ref);

          goto_assign();

          expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[name="matter_type1"]')).click();
          modalEl.findElement(by.css('input[name="matter_type2"]')).click();
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          goto_assign('2014-08-06T19:50');
          assignAnyProvider();
          browser.findElement(by.css('button[name="assign-provider"]')).click();

          checkAssign(case_ref);
        });
      });


      it('should assign case outside office hours without rota set', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(case_ref) {
          utils.goToCase(case_ref);

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
