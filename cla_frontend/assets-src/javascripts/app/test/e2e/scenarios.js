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

});
