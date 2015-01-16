(function () {
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants');

  var pageTitle = element(by.css('.PageHeader h1'));
  var tableBody = element(by.css('.ListTable tbody'));
  var cases = element.all(by.css('.ListTable tbody tr'));
  var query = element(by.name('q'));
  var querySubmit = element(by.name('case-search-submit'));

  describe('providerCaseList', function () {
    beforeEach(utils.setUpAsProvider);

    describe('A provider', function () {
      it('should be able to get a case list', function () {
        browser.get(CONSTANTS.providerBaseUrl);

        expect(browser.getCurrentUrl()).toContain(CONSTANTS.providerBaseUrl);
        expect(pageTitle.getText()).toBe('Cases');
      });

      it('should fill the search field, return results and clear the search', function () {
        var queryBinding = element(by.binding('searchParams.search'));

        // search
        query.sendKeys('Foo123');
        querySubmit.submit();

        expect(query.getAttribute('value')).toBe('Foo123');
        expect(browser.getCurrentUrl()).toContain('search=Foo123');
        expect(queryBinding.getText()).toContain('Foo123');

        // clearing the search
        queryBinding.click();
        expect(query.getAttribute('value')).toBe('');
        expect(browser.getCurrentUrl()).toBe(utils.getBaseAbsoluteUrl(CONSTANTS.providerBaseUrl));
      });

      it('should change the sort field', function () {
        element(by.cssContainingText('.ListTable th a', 'Name')).click();
        expect(browser.getCurrentUrl()).toContain('ordering=personal_details__full_name');
        element(by.cssContainingText('.ListTable th a', 'Name')).click();
        expect(browser.getCurrentUrl()).toContain('ordering=-personal_details__full_name');
      });

      it('should filter and show all test cases', function () {
        query.sendKeys('TP-9999-000');
        querySubmit.submit();

        assertCasesLength(3);
        assertContainsCase('TP-9999-0001');
        assertContainsCase('TP-9999-0002');
        assertContainsCase('TP-9999-0003');
      });

      it('should filter and show only new cases', function () {
        clickFilter('New');
        assertCasesLength(1);
        assertContainsCase('TP-9999-0001');
        assertContainsClass('TP-9999-0001', 'is-new');
      });

      it('should filter and show only opened cases', function () {
        clickFilter('Opened');
        assertCasesLength(1);
        assertContainsCase('TP-9999-0003');
      });

      it('should filter and show only accepted cases', function () {
        clickFilter('Accepted');
        assertCasesLength(1);
        assertContainsCase('TP-9999-0002');
        assertContainsClass('TP-9999-0002', 'is-complete');
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });
  });

  // helpers
  function clickFilter (name) {
    element(by.cssContainingText('.Filters a', name)).click();
  }

  function assertCasesLength (length) {
    cases.then(function (items) {
      expect(items.length).toBe(length);
    });
  }

  function assertContainsCase (caseRef) {
    expect(tableBody.getText()).toContain(caseRef);
  }

  function assertContainsClass (caseRef, className) {
    var row = element(by.cssContainingText('.ListTable tbody tr', caseRef));
    expect(row.getAttribute('class')).toContain(className);
  }
})();
