(function(){
  'use strict';

  var protractor = require('protractor');

  module.exports = {
    APP_BASE_URL: 'call_centre/',

    setUp: function(){
      var pro = protractor.getInstance(),
          driver = pro.driver;

      pro.manage().getCookie('sessionid').then(function(cookie) {
        if (!cookie) {
          driver.get(pro.baseUrl + 'call_centre/login/');

          driver.findElement(by.id('id_username')).sendKeys('test_operator');
          driver.findElement(by.id('id_password')).sendKeys('test_operator');
          driver.findElement(by.css('form')).submit();
          
          // kill django debug toolbar if it's showing
          pro.manage().addCookie('djdt', 'hide');
        }
      });
    },

    debugTeardown: function () {
      // debug log
      browser.manage().logs().get('browser').then(function(browserLog) {
        console.log('====================================================');
        console.log('LOG:');
        console.log(require('util').inspect(browserLog));
        console.log('====================================================');
      });
    },

    scrollTo: function (element) {
      browser.executeScript(function () {
        arguments[0].scrollIntoView();
      }, element);
    },

    expectUrl: function(absUrl, expectedUrl) {
      var pro = protractor.getInstance();

      expect((new RegExp(expectedUrl+'$')).test(absUrl)).toBe(true,
        ['Expected', absUrl, 'to be', pro.baseUrl+expectedUrl].join(' ')
      );
    },

    // getCase: function(case_id) {
    //   return browser.get(this.APP_BASE_URL + case_id + '/');
    // },

    createCase: function() {
      var pro = protractor.getInstance(),
          _this = this;

      browser.get(this.APP_BASE_URL);
      browser.getLocationAbsUrl().then(function (url) {
        _this.expectUrl(url, _this.APP_BASE_URL);
      });
      browser.findElement(by.css('.newCaseForm')).submit();
      return element.all(by.binding('case.reference')).get(0).getText();
    },

    showPersonalDetailsForm: function() {
      browser.findElement(by.css('#personal_details .VCard-view')).click();
    },

    enterPersonalDetails: function(details) {
      for (var name in details) {
        if (name == 'media_code') {
          browser.findElement(by.cssContainingText('[name="media_code"] option', details[name])).click();
        } else {
          this.fillField(name, details[name]);
        }
      }

    },

    fillField: function(name, value) {
      browser.findElement(by.css('[name="' + name + '"]')).sendKeys(value);
    },

    saveCase: function() {
      browser.findElement(by.css('button[name="save-personal-details"]')).click();
      this.scrollTo(browser.findElement(by.id('personal_details')));
    }
  };
})();