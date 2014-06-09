'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

var protractor = require('protractor');

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

  it('should get case list', function() {
    browser.get('operator/');
    browser.getLocationAbsUrl().then(function(url) {
      expectUrl(url, 'operator/');
    });
  });

  it('create new case', function() {
    // check that the case number in the URL matches that in the page title

    var pro = protractor.getInstance();
    var driver = pro.driver;
    var newCaseUrl;
    var baseUrl = pro.baseUrl + 'operator/';

    // just during Angular integration
    driver.get(baseUrl);

    // after login this should be the url browser.get('operator/');
    browser.getLocationAbsUrl().then(function(url) {
      expectUrl(url, 'operator/');
    });

    driver.findElement(by.id('create_case')).click();

    browser.getLocationAbsUrl().then(function(url) {
      // note: angular url, not from driver
      newCaseUrl = url;
    });

    driver.findElement(by.css('.PageHeader h1')).getInnerHtml().then(function(h1) {
      // console.log("h1 is: "+h1);
      // h1 is: MK-1983-0912
      expect(newCaseUrl).toMatch(baseUrl + h1 + '/');      
    });

  });
});
