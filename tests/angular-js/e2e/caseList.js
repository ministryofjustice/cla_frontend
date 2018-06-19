(function() {
  "use strict";

  var utils = require("./_utils");
  var CONSTANTS = require("../protractor.constants");
  var caseFilters = element(by.css(".Filters .LabelGroup"));

  describe("caseListManager", function() {
    beforeEach(function() {
      // utils.logout();
      utils.setUpAsOperatorManager();
    });

    afterEach(function() {
      utils.logout();
    });

    describe("An operator manager", function() {
      it("should be able to get a case list", function() {
        browser.get(CONSTANTS.callcentreBaseUrl);
        expect(browser.getCurrentUrl()).toContain(
          CONSTANTS.callcentreBaseUrl
        );
      });

      it("should update URL for case filter selections", function() {
        element(by.linkText("Phone cases")).click();
        expect(browser.getCurrentUrl()).toContain("only=phone");
        element(by.linkText("Web cases")).click();
        expect(browser.getCurrentUrl()).toContain("only=web");
        element(by.linkText("EOD")).click();
        expect(browser.getCurrentUrl()).toContain("only=eod");
        element(by.linkText("My cases")).click();
        expect(browser.getCurrentUrl()).toContain("only=my");
      });
    });
  });

  describe("caseList", function() {
    beforeEach(utils.setUp);

    describe("An operator", function() {
      it("should be able to get a case list", function() {
        browser.get(CONSTANTS.callcentreBaseUrl);

        expect(browser.getCurrentUrl()).toContain(
          CONSTANTS.callcentreBaseUrl
        );
      });

      it("should fill the search field, return results and clear the search", function() {
        var query = element(by.name("q"));
        var queryBinding = element(by.binding("searchParams.search"));

        // search
        query.sendKeys("Foo123");
        element(by.name("case-search-submit")).submit();

        expect(query.getAttribute("value")).toBe("Foo123");
        expect(browser.getCurrentUrl()).toContain("search=Foo123");
        expect(queryBinding.getText()).toContain("Foo123");

        // clearing the search
        queryBinding.click();
        expect(query.getAttribute("value")).toBe("");
        expect(browser.getCurrentUrl()).toBe(
          utils.getBaseAbsoluteUrl(CONSTANTS.callcentreBaseUrl)
        );
      });

      it("should change the sort field", function() {
        element(by.cssContainingText(".ListTable th a", "Name")).click();
        expect(browser.getCurrentUrl()).toContain(
          "ordering=personal_details__full_name"
        );
        element(by.cssContainingText(".ListTable th a", "Name")).click();
        expect(browser.getCurrentUrl()).toContain(
          "ordering=-personal_details__full_name"
        );
      });

      it("should create a case from listing page and go back to listing page", function() {
        var caseRef = element(by.binding("case.reference"));

        browser.get(CONSTANTS.callcentreBaseUrl);

        element(by.buttonText("Create a case")).click();

        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getCurrentUrl()).toContain(caseRef.getText());

        element(by.cssContainingText("a", "Back to cases")).click();
        expect(browser.getCurrentUrl()).toBe(
          utils.getBaseAbsoluteUrl(CONSTANTS.callcentreBaseUrl)
        );
      });

      it("should have case filters", function() {
        expect(caseFilters.isPresent()).toBe(true);
      });

      it("should update URL for case filter selections", function() {
        element(by.linkText("Phone cases")).click();
        expect(browser.getCurrentUrl()).toContain("only=phone");
        element(by.linkText("Web cases")).click();
        expect(browser.getCurrentUrl()).toContain("only=web");
        element(by.linkText("My cases")).click();
        expect(browser.getCurrentUrl()).toContain("only=my");
        expect(caseFilters.isPresent()).toBe(true);
      });
    });
  });
})();
