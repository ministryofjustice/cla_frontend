'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

var protractor = require('protractor');
var APP_BASE_URL = 'operator/';

// UTILS
function expectUrl(absUrl, expectedUrl) {
  var pro = protractor.getInstance();

  expect((new RegExp(expectedUrl+'$')).test(absUrl)).toBe(true,
    ['Expected', absUrl, 'to be', pro.baseUrl+expectedUrl].join(' ')
  );
}

describe('operatorApp', function() {

  // logs the user in before each test
  beforeEach(function() {
    var pro = protractor.getInstance();
    var driver = pro.driver;

    driver.get(pro.baseUrl + 'call_centre/login/');

    driver.findElement(by.id('id_username')).sendKeys('test_operator');
    driver.findElement(by.id('id_password')).sendKeys('test_operator');
    driver.findElement(by.css('form')).submit();
  });

  describe('Case List', function() {
    it('should get case list', function() {
      browser.get(APP_BASE_URL);
      browser.getLocationAbsUrl().then(function(url) {
        expectUrl(url, APP_BASE_URL);
      });
    });
  });


  describe('Create Case', function() {
    it('should create new case', function() {
      // check that the case number in the URL matches that in the page title

      var newCaseUrl;

      browser.get(APP_BASE_URL);

      // after login this should be the url browser.get('operator/');
      browser.getLocationAbsUrl().then(function(url) {
        expectUrl(url, APP_BASE_URL);
      });

      browser.findElement(by.id('create_case')).click();

      browser.getLocationAbsUrl().then(function(url) {
        // note: angular url, not from driver
        newCaseUrl = url;
      });

      browser.findElement(by.css('.PageHeader h1')).getInnerHtml().then(function(h1) {
        // console.log("h1 is: "+h1);
        // h1 is: MK-1983-0912
        expectUrl(APP_BASE_URL+ newCaseUrl, h1 + '/');
      });

    });
  });


  describe('Case Detail', function() {
    it('should get case list when given non existant case reference', function() {
      browser.get('operator/XX-0000-0000/');
      browser.getLocationAbsUrl().then(function(url) {
        expectUrl(url, APP_BASE_URL);

        browser.findElement(by.css('.Notice li')).getInnerHtml().then(function(el) {
          expect(el).toBe('The Case XX-0000-0000 could not be found!');
        })
      });
    });
  });

});
