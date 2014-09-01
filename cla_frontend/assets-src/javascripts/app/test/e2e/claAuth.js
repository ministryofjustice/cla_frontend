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

    describe('Auth login', function () {
      var pro = protractor.getInstance();

      function login_modal(username, password) {
        username = username || 'test_operator';
        password = password || 'test_operator';

        browser.findElement(by.css('.modal-content [name=login_frm] [name=username]')).clear();
        browser.findElement(by.css('.modal-content [name=login_frm] [name=username]')).sendKeys(username);
        browser.findElement(by.css('.modal-content [name=login_frm] [name=password]')).clear();
        browser.findElement(by.css('.modal-content [name=login_frm] [name=password]')).sendKeys(password);
        return browser.findElement(by.css('.modal-content [name=login_frm]')).submit();
      }

      it('should allow the operator to login using a modal if logged out', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+"/");

          utils.showPersonalDetailsForm();
          utils.enterPersonalDetails({
            'full_name': 'Foo Bar Quux'
          });

          // loggin the user out
          pro.manage().deleteCookie('sessionid');

          // saving personal details => a login modal should appear
          utils.saveCase();

          expect(browser.isElementPresent(by.css('.modal-content [name=login_frm]'))).toBe(true);

          // invalid login => errors
          login_modal('invalid_username', 'invalid_password');

          expect(browser.findElement(by.css('.modal-content [name=login_frm] .Error-all')).getText()).toContain('Please enter a correct username and password.');

          // valid login => no errors and modal dismissed
          login_modal();

          expect(browser.isElementPresent(by.css('.modal-content [name=login_frm]'))).toBe(false);

          // saving personal details again
          utils.saveCase();

          expect(browser.isElementPresent(by.css('.modal-content [name=login_frm]'))).toBe(false);
        });
      });
    });
  });
})();