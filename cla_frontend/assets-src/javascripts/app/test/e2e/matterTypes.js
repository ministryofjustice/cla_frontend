(function () {
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  var modal = element(by.css('.modal-content'));
  var mt1 = modal.element(by.css('input[name="matter_type1"]'));
  var mt2 = modal.element(by.css('input[name="matter_type2"]'));
  var modalSubmit = modal.element(by.css('button[type="submit"]'));
  var notices = element(by.css('.NoticeContainer--fixed'));
  var assignBtn = element(by.name('assign-provider'));

  describe('matterTypes', function () {
    beforeEach(utils.setUp);

    describe('An operator', function () {
      /**
       * Go to the assign page; if an option as_of parameter is given, it
       * will reload the page in 'mocked-time' mode.
       * If you are using this 'mocked-time' mode then make sure you
       * have set the matter types first.
       *
       * @param as_of datetime string in format (iso) yyyy-mm-ddThh:mm
       * @returns {!webdriver.promise.Promise.<void>}
       */

      it('should not be able to assign without diagnosis or eligibility', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          mt1.click();
          mt2.click();
          modalSubmit.click();
          expect(modal.isPresent()).toBe(false);
          expect(notices.getText()).toContain('The Case must be in scope and eligible to be assigned.');
        });
      });

      it('should be able to assign a case without required fields', function () {
        modelsRecipe.Case.createEmpty().then(function (case_ref) {
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

      it('should be given a warning when assigning a case without address fields', function () {
        modelsRecipe.Case.createWithRequiredFields().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          var messages = element(by.css('.modal-content .Notice[data-case-warnings]'));
          expect(messages.isPresent()).toBe(true);
          expect(messages.getText()).toContain('postcode');
          expect(messages.getText()).toContain('address');
          expect(messages.getText()).toContain('National Insurance number');
        });

      });


      it('should be shown a modal when trying to assign without matter types set', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(modal.getText()).toContain('Set Matter Types');
        });
      });

      it('should not be allowed to save modal without setting matter type 1 and 2', function () {
        modalSubmit.click();
        expect(modal.isPresent()).toBe(true);
      });


      it('should be allowed to save modal after setting matter type 1 and 2', function () {
        mt1.click();
        mt2.click();
        modalSubmit.click();
        expect(modal.isPresent()).toBe(false);
      });

      it('should go straight to assign page if MT1 and MT2 are already set', function () {
        modelsRecipe.Case.createWithRequiredRecommendedFields().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(modal.getText()).toContain('Set Matter Types');

          mt1.click();
          mt2.click();
          modalSubmit.click();
          expect(modal.isPresent()).toBe(false);

          var assignCaseUrl;
          browser.getLocationAbsUrl().then(function (url) {
            assignCaseUrl = url;
          });
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(modal.isPresent()).toBe(false);
          browser.getLocationAbsUrl().then(function (url) {
            expect(url).toBe(assignCaseUrl);
          });
        });
      });

      it('should assign a case to recommended provider (inside office hours)', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(modal.getText()).toContain('Set Matter Types');

          mt1.click();
          mt2.click();
          modalSubmit.click();
          expect(modal.isPresent()).toBe(false);

          goto_assign('2014-08-06T11:50');

          assignBtn.click();
          checkAssign(case_ref);
        });
      });


      it('should assign case to rota provider (outside office hours)', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(modal.getText()).toContain('Set Matter Types');

          mt1.click();
          mt2.click();
          modalSubmit.click();

          goto_assign('2014-08-06T19:50');
          expect(modal.isPresent()).toBe(false);
          // assign first provider in list
          element.all(by.name('provider')).get(0).click();

          expect(assignBtn.isEnabled()).toBe(true);
          assignBtn.click();
          checkAssign(case_ref);
        });
      });


      it('should assign case outside office hours without rota set', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          goto_assign();

          expect(modal.getText()).toContain('Set Matter Types');

          mt1.click();
          mt2.click();
          modalSubmit.click();
          expect(modal.isPresent()).toBe(false);

          goto_assign('2014-08-01T19:30');
          expect(assignBtn.isEnabled()).toBe(false);
          // assign first provider in list
          element.all(by.name('provider')).get(0).click();

          expect(assignBtn.isEnabled()).toBe(true);
          assignBtn.click();
          checkAssign(case_ref);
        });
      });
    });
  });

  // helpers
  function goto_assign (as_of) {
    utils.scrollTo(element(by.css('.CaseDetails-actions')));
    element(by.name('close-case')).click();
    var clicked = element(by.name('close--assign-provider')).click();
    if (as_of) {
      browser.getLocationAbsUrl().then(function (url) {
        return browser.get(url + '?as_of=' + encodeURIComponent(as_of));
      });
    }
    return clicked;
  }

  function checkAssign (case_ref) {
    var txt = element(by.css('.Notice.success')).getText();
    expect(txt).toContain('Case ' + case_ref + ' assigned to');
  }
})();
