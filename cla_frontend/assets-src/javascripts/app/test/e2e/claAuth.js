(function(){
  'use strict';

  var protractor = require('protractor'),
      ptor = protractor.getInstance(),
      utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants'),
      // browser elements
      loginForm = element(by.name('login_frm'));

  function login_modal(username, password) {
    username = username || 'test_operator';
    password = password || 'test_operator';

    loginForm.element(by.name('username')).clear().sendKeys(username);
    loginForm.element(by.name('password')).clear().sendKeys(password);

    return loginForm.submit();
  }

  describe('As Operator', function() {
    beforeEach(utils.setUp);

    describe('Auth login', function () {
      it('should allow the operator to login using a modal if logged out', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          utils.showPersonalDetailsForm();
          utils.enterPersonalDetails({
            'full_name': 'Foo Bar Quux'
          });

          // loggin the user out
          ptor.manage().deleteCookie('sessionid');

          // saving personal details => a login modal should appear
          utils.saveCase();
          expect(loginForm.isPresent()).toBe(true);

          // invalid login => errors
          login_modal('invalid_username', 'invalid_password');
          expect(loginForm.element(by.css('.Error-all')).getText()).toContain('Please enter a correct username and password.');

          // valid login => no errors and modal dismissed
          login_modal();
          expect(loginForm.isPresent()).toBe(false);

          // saving personal details again
          utils.saveCase();
          expect(loginForm.isPresent()).toBe(false);
        });
      });
    });
  });
})();