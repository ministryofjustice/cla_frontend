'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

var protractor = require('protractor');
var APP_BASE_URL = 'call_centre/';

// UTILS
function expectUrl(absUrl, expectedUrl) {
  var pro = protractor.getInstance();

  expect((new RegExp(expectedUrl+'$')).test(absUrl)).toBe(true,
    ['Expected', absUrl, 'to be', pro.baseUrl+expectedUrl].join(' ')
  );
}

function createCase() {
  browser.get(APP_BASE_URL);
  browser.getLocationAbsUrl().then(function (url) {
    expectUrl(url, APP_BASE_URL);
  });
  browser.findElement(by.css('.newCaseForm')).submit();
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

    // kill django debug toolbar if it's showing
    pro.manage().addCookie('djdt', 'hide');

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

      createCase();

      var newCaseUrl;
      browser.getLocationAbsUrl().then(function(url) {
        // note: angular url, not from driver
        newCaseUrl = url;
      });

      browser.findElement(by.css('.CaseDetails-caseNum')).getInnerHtml().then(function(h1) {
        // console.log("h1 is: "+h1);
        // h1 is: MK-1983-0912
        expectUrl(APP_BASE_URL+ newCaseUrl, h1 + '/');
      });

    });
  });

  describe('Case List Navigation', function () {
    it('should keep query params from case_list when going back from case_detail', function () {
      browser.get(APP_BASE_URL);

      browser.getLocationAbsUrl().then(function(url) {
        expectUrl(url, APP_BASE_URL);
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

  describe('Case Detail', function() {
    it('should get case list when given non existant case reference', function() {
      browser.get('call_centre/XX-0000-0000/');
      browser.getLocationAbsUrl().then(function(url) {
        expectUrl(url, APP_BASE_URL);

        browser.findElement(by.css('.Notice li')).getInnerHtml().then(function(el) {
          expect(el).toBe('The Case XX-0000-0000 could not be found!');
        });
      });
    });
  });

  describe('Create Case with Adaptations', function () {
    it('should create a new case with the BSL - Webcam adaptation', function () {
      createCase();
      showPersonalDetailsForm();
      enterPersonalDetails({
        'full_name': 'Foo Bar Quux',
        'postcode': 'F00 B4R',
        'street': '1 Foo Bar',
        'mobile_phone': '0123456789'
      });
      showAdaptationsOptions();
      selectAdaptations(['bsl_webcam']);
      saveCase();
      expect(displayedAdaptation()).toBe('BSL - Webcam');
    });


    function showPersonalDetailsForm() {
      browser.findElement(by.css('#personal_details')).click();
    }

    function enterPersonalDetails(details) {
      for (var name in details) {
        fillField(name, details[name]);
      }
    }

    function fillField(name, value) {
      browser.findElement(by.css('[name=' + name + ']')).sendKeys(value);
    }

    function showAdaptationsOptions() {
      browser.findElement(by.css('#show_adaptations')).click();
    }

    function selectAdaptations(checkboxes) {
      checkboxes.map(function (name) {
        browser.findElement(by.css('[name=' + name + '] + span')).click();
      });
    }

    function saveCase() {
      browser.findElement(by.css('#personal_details [type=submit]')).click();
    }

    function displayedAdaptation() {
      return browser.findElement(by.repeater('item in selected_adaptations').row(0)).getText();
    }
  });

  describe('Case Set Matter Types and Assign', function () {

    function open_modal() {
      return browser.findElement(by.css("a.Button[ng-click^=assign_to_provider]")).click();
    }


    it('should show modal when trying to assign without matter types set', function () {
      createCase();
      open_modal();
        expect(browser.findElement(by.css('.set-matter-type-modal h3')).getText()).toBe('Set Matter Types');
    });

    it('should not allow saving modal without setting matter type 1 and 2', function () {
      createCase();
      open_modal();
      var modalEl = browser.findElement(by.css('div.modal'));
      modalEl.findElement(by.css("button[type='submit'")).click();
      expect(modalEl.isElementPresent(by.css("button[type='submit'"))).toBe(true);
    });


    it('should allow saving modal after setting matter type 1 and 2', function () {
      createCase();
      open_modal();

      var modalEl = browser.findElement(by.css('div.modal'));
      modalEl.findElement(by.css("input[name='matter_type1']")).click();
      modalEl.findElement(by.css("input[name='matter_type2']")).click();
      modalEl.findElement(by.css("button[type='submit'")).click();
      expect(browser.isElementPresent(by.css("div.modal"))).toBe(false);
    });

    it('should go straight to assign page if MT1 and MT2 are already set', function () {
      createCase();
      open_modal();
      expect(browser.findElement(by.css('.set-matter-type-modal h3')).getText()).toBe('Set Matter Types');
      var modalEl = browser.findElement(by.css('div.modal'));
      modalEl.findElement(by.css("input[name='matter_type1']")).click();
      modalEl.findElement(by.css("input[name='matter_type2']")).click();
      modalEl.findElement(by.css("button[type='submit'")).click();
      expect(browser.isElementPresent(by.css("div.modal"))).toBe(false);
      var assignCaseUrl;
      browser.getLocationAbsUrl().then(function (url) {
        assignCaseUrl = url;
      });
      browser.findElement(by.css("a[ui-sref='case_detail.edit']")).click();
      browser.findElement(by.css("a.Button[ng-click^=assign_to_provider]")).click();
      expect(browser.isElementPresent(by.css("div.modal"))).toBe(false);
      browser.getLocationAbsUrl()
        .then(function (url) {
        expect(url).toBe(assignCaseUrl);
      });
    });
  });
});
