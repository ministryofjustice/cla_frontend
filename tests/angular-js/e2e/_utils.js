(function() {
  "use strict";

  var CONSTANTS = require("../protractor.constants");

  function login(login_path, user, pass) {
    var username = element(by.id("id_username"));
    var password = element(by.id("id_password"));
    var form = element(by.name("login_frm"));

    browser
      .manage()
      .getCookie("sessionid")
      .then(function(cookie) {
        if (!cookie) {
          browser.ignoreSynchronization = true;
          browser.get(login_path);

          // kill django debug toolbar if it's showing
          browser.manage().addCookie({ name: "djdt", value: "hide" });
          browser.get(login_path);

          username.sendKeys(user);
          password.sendKeys(pass);
          form.submit();

          browser.ignoreSynchronization = false;
          browser.get("");

          // TODO: This maybe a less flaky way to wait for login
          // Login takes some time, so wait until it's done.
          // For the test app's login, we know it's done when it redirects to
          // /call_centre.
          // browser.driver.wait(function() {
          //   return browser.driver.getCurrentUrl().then(function(url) {
          //     return /call_centre/.test(url);
          //   });
          // });
        }
      });
  }

  module.exports = {
    setUp: function() {
      login(CONSTANTS.authUrl + "login/", "test_operator", "test_operator");
    },

    setUpAsOperatorManager: function() {
      login(
        CONSTANTS.authUrl + "login/",
        "test_operator_manager",
        "test_operator_manager"
      );
    },

    setUpAsProvider: function() {
      login(
        CONSTANTS.providerBaseUrl + "login/",
        "test_duncanlewis",
        "test_duncanlewis"
      );
    },

    getBaseAbsoluteUrl: function(suffix) {
      return browser.baseUrl + suffix;
    },

    logout: function() {
      browser.manage().deleteAllCookies();
    },

    debugTeardown: function() {
      // debug log
      browser
        .manage()
        .logs()
        .get("browser")
        .then(function(browserLog) {
          console.log("====================================================");
          console.log("LOG:");
          console.log(require("util").inspect(browserLog));
          console.log("====================================================");
        });
    },

    checkLastOutcome: function(code) {
      var codeSpan = element.all(by.css(".CaseHistory-label")).get(0);
      expect(codeSpan.getText()).toEqual(code);
    },

    scrollTo: function(element) {
      var promise = browser.driver.executeScript(function(elem) {
        // workaround angular-sticky issue with scrollIntoView interference
        document.body.style.paddingBottom = "100px";

        elem.scrollIntoView(false);
      }, element.getWebElement());
      return promise;
    },

    scrollToBottom: function(element) {
      browser.driver.executeScript(function() {
        arguments[0].scrollIntoView();
      }, element.getWebElement());
    },

    expectUrl: function(absUrl, expectedUrl) {
      expect(new RegExp(expectedUrl + "$").test(absUrl)).toBe(
        true,
        ["Expected", absUrl, "to be", browser.baseUrl + expectedUrl].join(" ")
      );
    },

    createCase: function() {
      var _this = this;

      browser.get(this.APP_BASE_URL);
      browser.getCurrentUrl().then(function(url) {
        _this.expectUrl(url, _this.APP_BASE_URL);
      });
      element(by.css(".newCaseForm")).submit();
      return element
        .all(by.binding("case.reference"))
        .get(0)
        .getText();
    },

    fillField: function(name, value) {
      if (value === true || value === false) {
        element(by.name(name)).click();
      } else {
        /*jshint -W030 */
        element(by.css('[name="' + name + '"]')).sendKeys(value).blur;
        /*jshint +W030 */
      }
    },

    goToCaseDetail: function(caseRef) {
      return browser.driver.executeAsyncScript(
        function(el, caseRef, callback) {
          if (window.__injector === undefined) {
            var $el = document.querySelector(el);
            window.__injector = angular.element($el).injector();
          }
          var $state = window.__injector.get("$state");

          $state
            .go("case_detail.edit.diagnosis", { caseref: caseRef })
            .then(callback);
        },
        browser.rootEl,
        caseRef
      );
    },

    goToCaseList: function() {
      // TODO not tested yet
      return browser.driver.executeAsyncScript(function(el, callback) {
        if (window.__injector === undefined) {
          var $el = document.querySelector(el);
          window.__injector = angular.element($el).injector();
        }
        var $state = window.__injector.get("$state");

        $state.go("case_list").then(callback);
      }, browser.rootEl);
    },

    manuallySelectProvider: function(providerName) {
      var manualBtn = element(by.name("assign-manually"));
      var label = element(
        by.cssContainingText("label.FormRow-label", providerName)
      );

      expect(manualBtn.isPresent()).toBe(true);
      this.scrollTo(manualBtn);
      manualBtn.click();

      this.scrollTo(label);
      label.click();
    },

    manuallySetProvider: function(providerId) {
      return browser.driver.executeScript(function(_id) {
        var scope = angular.element('[name="assign_provider_form"]').scope();
        scope.selected_provider.id = _id;
      }, providerId);
    }
  };
})();
