/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils'), // UTILS
      APP_BASE_URL = utils.APP_BASE_URL;

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('Create Case', function() {
      it('should create new case', function() {
        // check that the case number in the URL matches that in the page title
        utils.createCase();

        var newCaseUrl;
        browser.getLocationAbsUrl().then(function(url) {
          // note: angular url, not from driver
          newCaseUrl = url;
        });

        browser.findElement(by.css('.CaseDetails-caseNum')).getInnerHtml().then(function(h1) {
          utils.expectUrl(APP_BASE_URL+ newCaseUrl, h1 + '/diagnosis/');
        });

      });
    });

    describe('Case Detail', function() {
      it('should get case list when given non existant case reference', function() {
        browser.get('call_centre/XX-0000-0000/');
        browser.getLocationAbsUrl().then(function(url) {
          utils.expectUrl(url, APP_BASE_URL);

          browser.findElement(by.css('.Notice.error')).getInnerHtml().then(function(el) {
            expect(el).toBe('The Case XX-0000-0000 could not be found!');
          });
        });
      });
    });

    describe('Create Case with Adaptations', function () {
      it('should create a new case with the BSL - Webcam adaptation', function () {
        var selected_adaptations = ['BSL - Webcam', 'Callback preference', 'Minicom', 'Skype', 'Text relay'];
        utils.createCase();
        utils.showPersonalDetailsForm();
        utils.enterPersonalDetails({
          'full_name': 'Foo Bar Quux',
          'postcode': 'F00 B4R',
          'street': '1 Foo Bar',
          'mobile_phone': '0123456789'
        });
        selectAdaptations(selected_adaptations);
        utils.saveCase();

        expect(element.all(by.binding('personal_details.full_name')).get(0).getText()).toEqual('Foo Bar Quux');
        expect(element.all(by.binding('personal_details.postcode')).get(0).getText()).toEqual('F00 B4R');
        expect(element.all(by.binding('personal_details.street')).get(0).getText()).toEqual('1 Foo Bar');
        expect(element.all(by.binding('personal_details.mobile_phone')).get(0).getText()).toEqual('0123456789');

        // check adaptations have been added
        var adaptations = element.all(by.repeater('item in selected_adaptations')).map(function (el) {
          return el.getText();
        });
        adaptations.then(function (result) {
          for (var i = 0; i < selected_adaptations.length; i++) {
            expect(result).toContain(selected_adaptations[i]);
          }
        });
      });

      function selectAdaptations(checkboxes) {
        checkboxes.map(function (name) {
          browser.findElement(by.cssContainingText('[name="adaptations"] option', name)).click();
        });
      }
    });
  });
})();
