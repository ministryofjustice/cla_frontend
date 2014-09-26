(function(){
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants');

  describe('Operator Case List', function() {
    beforeEach(utils.setUp);

    describe('Case list navigation', function () {
      it('should get case list', function() {
        browser.get(CONSTANTS.callcentreBaseUrl);

        expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);
      });

      it('should correctly fill the search field, return results and clear the search', function () {
        var query = element(by.name('q'));
        var queryBinding = element(by.binding('searchParams.search'));

        // search
        query.sendKeys('Foo123');
        element(by.name('case-search-submit')).submit();

        expect(query.getAttribute('value')).toBe('Foo123');
        expect(browser.getLocationAbsUrl()).toContain('search=Foo123');
        expect(queryBinding.getText()).toContain('Foo123');

        // clearing the search
        queryBinding.click();
        expect(query.getAttribute('value')).toBe('');
        expect(browser.getLocationAbsUrl()).toBe(CONSTANTS.getCallcentreBaseAbsoluteUrl());
      });

      it('should change the sort field', function () {
        element(by.cssContainingText('.ListTable th a', 'Name')).click();
        expect(browser.getLocationAbsUrl()).toContain('ordering=personal_details__full_name');
        element(by.cssContainingText('.ListTable th a', 'Name')).click();
        expect(browser.getLocationAbsUrl()).toContain('ordering=-personal_details__full_name');
      });

      it('should create a case from listing page and go back to listing page', function () {
        var caseRef = element(by.binding('case.reference'));

        browser.get(CONSTANTS.callcentreBaseUrl);

        element(by.buttonText('Create a case')).click();

        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());

        element(by.cssContainingText('a','Back to cases')).click();
        expect(browser.getLocationAbsUrl()).toBe(CONSTANTS.getCallcentreBaseAbsoluteUrl());
      });
    });
  });
})();
