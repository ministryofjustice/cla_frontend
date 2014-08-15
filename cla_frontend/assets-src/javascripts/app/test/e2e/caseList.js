/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var utils = require('./_utils'), // UTILS
      APP_BASE_URL = utils.APP_BASE_URL;

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('Case List', function() {
      it('should get case list', function() {
        browser.get(APP_BASE_URL);
        browser.getLocationAbsUrl().then(function(url) {
          utils.expectUrl(url, APP_BASE_URL);
        });
      });
    });

    describe('Case List Navigation', function () {
      it('should keep query params from case_list when going back from case_detail', function () {
        browser.get(APP_BASE_URL);

        browser.getLocationAbsUrl().then(function(url) {
          utils.expectUrl(url, APP_BASE_URL);
        });

        // add some query params by sending a search
        var searchBox = browser.findElement(by.name('q'));

        searchBox.sendKeys('Foo123');
        expect(searchBox.getAttribute('value')).toBe('Foo123');
        browser.findElement(by.id('search')).submit();
        browser.getLocationAbsUrl().then(function (url) {
          var searched_url = url;

          // create a case
          browser.findElement(by.id('create_case')).click();

          // go back & see that query params have been retained.
          browser.findElement(by.cssContainingText('a','Back to cases')).click();
          browser.getLocationAbsUrl().then(function (url2) {
            expect(searched_url).toBe(url2);
          });
        });
      });
    });
  });
})();
