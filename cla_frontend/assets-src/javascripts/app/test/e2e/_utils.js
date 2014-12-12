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

    getBaseAbsoluteUrl: function(suffix) {
      return ptor.baseUrl + suffix;
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

    checkLastOutcome: function(code) {
      var codeSpan = element.all(by.css('.CaseHistory-label')).get(0);
      expect(codeSpan.getText()).toEqual(code);
    },

    scrollTo: function(elemFinder) {
      var promise = browser.driver.executeScript(function(elem) {
        elem.scrollIntoView(false);
      }, elemFinder);
      return promise;
    },

    scrollToBottom: function (element) {
      browser.driver.executeScript(function () {
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

    goToCaseDetail: function(caseRef) {
      return browser.driver.executeAsyncScript(function(el, caseRef, callback) {
        if (window.__injector === undefined) {
          var $el = document.querySelector(el);
          window.__injector = angular.element($el).injector();
        }
        var $state = window.__injector.get('$state');

        $state.go('case_detail.edit', {'caseref': caseRef}).then(callback);

      }, browser.rootEl, caseRef);
    },

    goToCaseList: function() {
      // TODO not tested yet
      return browser.driver.executeAsyncScript(function(el, callback) {
        if (window.__injector === undefined) {
          var $el = document.querySelector(el);
          window.__injector = angular.element($el).injector();
        }
        var $state = window.__injector.get('$state');

        $state.go('case_list').then(callback);

      }, browser.rootEl);
    },

    manuallySelectProvider: function (providerName) {
      var manualBtn = element(by.name('assign-manually'));
      var label = element(by.cssContainingText('label.FormRow-label', providerName));

      expect(manualBtn.isPresent()).toBe(true);
      this.scrollTo(manualBtn);
      manualBtn.click();

      this.scrollTo(label);
      label.click();
    },

    manuallySetProvider: function (providerId) {
      return browser.driver.executeScript(function(_id) {
        var scope = angular.element('[name="assign_provider_form"]').scope();
        scope.selected_provider.id = _id;
      }, providerId);
    }
  };
})();
