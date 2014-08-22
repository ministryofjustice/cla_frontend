/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var utils = require('./_utils'); // UTILS

  describe('Operator Case List', function() {
    beforeEach(utils.setUp);

    describe('Case List Navigation', function () {
      var searchedUrl, caseRef;

      it('should get case list', function() {
        browser.get(utils.APP_BASE_URL);

        expect(browser.getLocationAbsUrl()).toContain(utils.APP_BASE_URL);
      });

      it('should correctly fill the search field and return results', function () {
        browser.findElement(by.name('q')).sendKeys('Foo123');
        browser.findElement(by.name('case-search-submit')).submit();

        expect(browser.findElement(by.name('q')).getAttribute('value')).toBe('Foo123');
        expect(browser.getLocationAbsUrl()).toContain('search=Foo123');
      });

      it('should change the sort field', function () {
        browser.findElement(by.cssContainingText('.CaseList th a', 'Name')).click();
        expect(browser.getLocationAbsUrl()).toContain('ordering=personal_details__full_name');
        browser.findElement(by.cssContainingText('.CaseList th a', 'Name')).click();
        searchedUrl = browser.getLocationAbsUrl();
        expect(searchedUrl).toContain('ordering=-personal_details__full_name');
      });

      it('should create a case from listing page', function () {
        browser.findElement(by.buttonText('Create a case')).click();

        caseRef = element(by.binding('case.reference'));
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());
      });

      it('should keep same search params when returning to listing page', function () {
        browser.findElement(by.cssContainingText('a','Back to cases')).click();
        expect(searchedUrl).toBe(browser.getLocationAbsUrl());
      });

      it('should clear the search', function () {
        browser.findElement(by.cssContainingText('a','Back to all cases')).click();
        expect(browser.findElement(by.name('q')).getAttribute('value')).toBe('');
        expect(browser.getLocationAbsUrl()).toContain('search=&');
      });
    });
  });
})();
