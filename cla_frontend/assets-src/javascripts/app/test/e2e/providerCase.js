(function(){
  'use strict';

  var utils = require('../e2e/_utils'),
      CONSTANTS = require('../protractor.constants.js'),
      modelsRecipe = require('./_modelsRecipe');

  describe('Provider Case Control', function() {
    var case_to_accept;
    var accept_button = element(by.name('accept-case'));
    var close_button = element(by.name('provider-close-case'));

    function get_provider() {
      return element(by.css('.ContactBlock-heading')).getText();
    }

    function do_assign() {
      element(by.name('assign-provider')).click();
    }

    function manually_select_provider() {
      element(by.cssContainingText('.Button.Button--secondary', 'Assign other provider manually')).click();
      element(by.cssContainingText('input[name="provider"] + strong', 'Duncan Lewis')).click();
    }

    describe('As Operator', function () {
      beforeEach(utils.setUp);

      it('should create a case as operator and assign (manually) to a provider', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
          case_to_accept = case_ref;
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/assign/?as_of=2014-08-06T11:50');
          get_provider().then(function (provider) {
            if (provider !== 'Duncan Lewis') {
              manually_select_provider();
            }
            do_assign();
          });
        });
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });

    describe('As Provider', function () {
      beforeEach(utils.setUpAsProvider);

      it('should be able to accept a case', function(){
        browser.get(CONSTANTS.providerBaseUrl + case_to_accept + '/');

        expect(close_button.isPresent()).toBe(false);
        expect(accept_button.isPresent()).toBe(true);

        // click but cancel accept
        accept_button.click();

        // check can't accept anymore
        expect(accept_button.isPresent()).toBe(false);
        expect(close_button.isPresent()).toBe(true);
        expect(element(by.css('.NoticeContainer--fixed')).getInnerHtml()).toContain('Case accepted successfully');
      });

      it('should be able to close a case', function(){
        expect(close_button.isPresent()).toBe(true);

        // click but cancel accept
        close_button.click();
        browser.switchTo().alert().dismiss();

        expect(close_button.isPresent()).toBe(true);

        // click and accept case
        close_button.click();
        browser.switchTo().alert().accept();

        // check can't accept anymore
        expect(element(by.css('.NoticeContainer--fixed')).getInnerHtml()).toContain('Case ' + case_to_accept + ' closed successfully');
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });
  });
})();
