(function () {
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  var caseRef;
  var enteredPostcode = 'sw1h9aj';
  var returnedPostcode = 'SW1H 9AJ';
  var modal = element(by.css('.modal-content'));
  var modalHeading = modal.element(by.css('header h2'));
  var addresses = element.all(by.repeater('address in addresses | filter:address_search'));
  var searchBtn = element(by.name('find-address'));
  var submitBtn = element(by.name('select-address'));
  var cancelBtn = element(by.name('cancel-address'));
  var savePD = element(by.name('save-personal-details'));

  describe('addressFinder', function () {
    beforeEach(utils.setUp);

    describe('Operator', function () {
      it('should be able to search for an address on enter', function () {
        modelsRecipe.Case.createEmpty().then(function (_caseRef) {
          caseRef = _caseRef;

          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + '/');

          element(by.name('create-newuser')).click();
          element(by.name('postcode')).sendKeys(enteredPostcode);
          element(by.name('postcode')).sendKeys(protractor.Key.ENTER);

          // check modal is present
          expect(modal.isPresent()).toBe(true);
          // contains correct heading
          expect(modalHeading.getText()).toBe('Address search');
        });
      });


      it('should return 1 result for SW1H 9AJ', function () {
        // contains correct postcode
        expect(modal.getText()).toContain(enteredPostcode);
        // and has correct amount of results
        addresses.then(function (items) {
          expect(items.length).toBe(1);
        });
      });


      it('should not fill postcode and street if cancelled', function () {
        addresses.get(0).element(by.css('input[type="radio"]')).click();
        cancelBtn.click();

        expect(element(by.name('postcode')).getAttribute('value')).toBe(enteredPostcode);
        expect(element(by.name('street')).getAttribute('value')).toBe('');
      });


      it('should be able to search an address on button click', function () {
        searchBtn.click();

        // check modal is present
        expect(modal.isPresent()).toBe(true);
        // contains correct heading
        expect(modalHeading.getText()).toBe('Address search');
      });


      it('should fill postcode and street with selected option', function () {
        addresses.get(0).element(by.css('input[type="radio"]')).click();
        submitBtn.click();

        expect(element(by.name('postcode')).getAttribute('value')).toBe(returnedPostcode);
        expect(element(by.name('street')).getAttribute('value')).toBe('Ministry of Justice\n102 Petty France\nLondon');

        savePD.click();
        browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');

        expect(element(by.exactBinding('personal_details.postcode')).getText()).toBe(returnedPostcode);
        expect(element.all(by.binding('personal_details.street')).get(0).getText()).toBe('Ministry of Justice\n102 Petty France\nLondon');
      });


    });
  });
})();
