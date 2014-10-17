(function () {
  'use strict';

  var protractor = require('protractor'),
      ptor = protractor.getInstance(),
      CONSTANTS = require('../protractor.constants');

  function login(login_path, user, pass) {
    var driver = ptor.driver;

    ptor.manage().getCookie('sessionid').then(function (cookie) {
      if (!cookie) {
        driver.get(ptor.baseUrl + login_path);

        // kill django debug toolbar if it's showing
        ptor.manage().addCookie('djdt', 'hide');

        driver.get(ptor.baseUrl + login_path);
        driver.findElement(by.id('id_username')).sendKeys(user);
        driver.findElement(by.id('id_password')).sendKeys(pass);
        driver.findElement(by.css('form')).submit();
      }
    });
  }

  module.exports = {
    setUp: function () {
      login(CONSTANTS.callcentreBaseUrl + 'login/', 'test_operator', 'test_operator');
    },

    setUpAsOperatorManager: function () {
      login(CONSTANTS.callcentreBaseUrl + 'login/', 'test_operator_manager', 'test_operator_manager');
    },

    setUpAsProvider: function () {
      login(CONSTANTS.providerBaseUrl + 'login/', 'test_duncanlewis', 'test_duncanlewis');
    },

    logout: function () {
      element(by.css('.UserMenu-toggle')).click();
      element(by.cssContainingText('a[target="_self"]', 'Sign out')).click();
      ptor.manage().deleteAllCookies();
    },

    debugTeardown: function () {
      // debug log
      browser.manage().logs().get('browser').then(function (browserLog) {
        console.log('====================================================');
        console.log('LOG:');
        console.log(require('util').inspect(browserLog));
        console.log('====================================================');
      });
    },

    scrollTo: function(elemFinder) {
      var promise = browser.executeScript(function(elem) {
        elem.scrollIntoView(false);
      }, elemFinder);
      return promise;
    },

    scrollToBottom: function (element) {
      browser.executeScript(function () {
        arguments[0].scrollIntoView();
      }, element);
    },

    expectUrl: function (absUrl, expectedUrl) {
      expect((new RegExp(expectedUrl+'$')).test(absUrl)).toBe(true,
        ['Expected', absUrl, 'to be', ptor.baseUrl+expectedUrl].join(' ')
      );
    },

    createCase: function () {
      var _this = this;

      browser.get(this.APP_BASE_URL);
      browser.getLocationAbsUrl().then(function (url) {
        _this.expectUrl(url, _this.APP_BASE_URL);
      });
      element(by.css('.newCaseForm')).submit();
      return element.all(by.binding('case.reference')).get(0).getText();
    },

    fillField: function (name, value) {
      if (value === true || value === false) {
        element(by.name(name)).click();
      } else {
        /*jshint -W030 */
        element(by.css('[name="' + name + '"]')).sendKeys(value).blur;
        /*jshint +W030 */
      }
    },

    manuallySelectProvider: function (providerName) {
      var manualBtn = element(by.cssContainingText('.Button.Button--secondary', 'Assign other provider manually'));
      this.scrollTo(manualBtn);
      manualBtn.click();
      element(by.cssContainingText('input[name="provider"] + strong', providerName)).click();
    }
  };
})();
