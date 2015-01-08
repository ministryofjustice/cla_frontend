(function () {
  'use strict';

  var utils = require('./_utils');
  var modelsRecipe = require('./_modelsRecipe');
  var CONSTANTS = require('../protractor.constants');

  // browser elements
  var loginForm = element(by.name('login_frm'));

  describe('claAuth', function () {
    beforeEach(utils.setUp);

    describe('An operator', function () {
      it('should be able to login using a modal if logged out', function () {
        modelsRecipe.Case.createEmptyWithPersonalDetails().then(function (case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/');

          enter_personal_details({
            'full_name': 'Foo Bar Quux'
          });

          // loggin the user out
          browser.manage().deleteCookie('sessionid');

          // saving personal details => a login modal should appear
          save_personal_details();
          expect(loginForm.isPresent()).toBe(true);

          // invalid login => errors
          login_modal('invalid_username', 'invalid_password');
          expect(loginForm.element(by.css('.Error-all')).getText()).toContain('Please enter a correct username and password.');

          // valid login => no errors and modal dismissed
          login_modal();
          expect(loginForm.isPresent()).toBe(false);

          // saving personal details again
          save_personal_details();
          expect(loginForm.isPresent()).toBe(false);
        });
      });
    });
  });

  // helpers
  function login_modal (username, password) {
    username = username || 'test_operator';
    password = password || 'test_operator';

    loginForm.element(by.name('username')).clear().sendKeys(username);
    loginForm.element(by.name('password')).clear().sendKeys(password);

    return loginForm.submit();
  }

  function enter_personal_details (details) {
    element(by.css('#personal_details .VCard-view')).click();

    for (var name in details) {
      utils.fillField(name, details[name]);
    }
  }

  function save_personal_details () {
    element(by.name('save-personal-details')).click();
    utils.scrollTo(element(by.id('personal_details')));
  }
})();
