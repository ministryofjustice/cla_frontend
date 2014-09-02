(function(){
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants');

  describe('Operator Case List', function() {
    beforeEach(utils.setUp);

    describe('Case list navigation', function () {
      var searchedUrl, caseRef;

      it('should get case list', function() {
        browser.get(CONSTANTS.callcentreBaseUrl);

        expect(browser.getLocationAbsUrl()).toContain(CONSTANTS.callcentreBaseUrl);
      });

      it('should correctly fill the search field, return results and clear the search', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        // search
        browser.findElement(by.name('q')).sendKeys('Foo123');
        browser.findElement(by.name('case-search-submit')).submit();

        expect(browser.findElement(by.name('q')).getAttribute('value')).toBe('Foo123');
        expect(browser.getLocationAbsUrl()).toContain('search=Foo123');
        expect(browser.findElement(by.css('.search-term')).getText()).toBe('Foo123');

        // clearing the search
        browser.findElement(by.css('.search-term')).click();
        expect(browser.findElement(by.name('q')).getAttribute('value')).toBe('');
        expect(browser.getLocationAbsUrl()).toBe(CONSTANTS.getCallcentreBaseAbsoluteUrl());
      });

      it('should change the sort field', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        browser.findElement(by.cssContainingText('.CaseList th a', 'Name')).click();
        expect(browser.getLocationAbsUrl()).toContain('ordering=personal_details__full_name');
        browser.findElement(by.cssContainingText('.CaseList th a', 'Name')).click();
        searchedUrl = browser.getLocationAbsUrl();
        expect(searchedUrl).toContain('ordering=-personal_details__full_name');
      });

      it('should create a case from listing page and go back to listing page', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        browser.findElement(by.buttonText('Create a case')).click();

        caseRef = element(by.binding('case.reference'));
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());

        browser.findElement(by.cssContainingText('a','Back to cases')).click();
        expect(browser.getLocationAbsUrl()).toBe(browser.getLocationAbsUrl());
      });
    });
  });
})();
