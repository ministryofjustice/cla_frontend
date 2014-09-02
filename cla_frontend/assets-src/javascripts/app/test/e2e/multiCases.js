(function(){
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants'),
      modelsRecipe = require('./_modelsRecipe');

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    describe('Case List', function () {
      var randomName = Math.random().toString(36).substring(7);
      it('should filter by person', function() {

        modelsRecipe.Case.createRecipe({}, {
            full_name: randomName
          }
        ).then(function() {
          // go to list => assert num of rows > 1
          browser.get(CONSTANTS.callcentreBaseUrl);

          // findelement by random name and click on the name
          browser.findElement(by.cssContainingText('a', randomName)).click();

          // assert that url changed and num of rows == 1
          browser.findElements(by.css('.CaseList tbody tr')).then(function(els) {
            expect(els.length).toBe(1);
          });
          expect(browser.findElement(by.css('.search-person')).getText()).toBe(randomName);
        });
      });

      it('should allow creating a Case for selected person', function() {
        // click on create new case for that person
        browser.findElement(by.buttonText('Create a case for '+randomName)).click();

        // assert that personal details is filled in properly
        var caseRef = element(by.binding('case.reference'));
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());
        browser.findElement(by.binding('personal_details.full_name')).then(function(el) {
          expect(el.getText()).toBe(randomName);
        });
      });

      it('should allow going back to case list for that person', function() {
        // click go back to case list
        browser.findElement(by.cssContainingText('a','Back to cases')).click();

        // assert that we are still in multi cases per user list
        browser.findElements(by.css('.CaseList tbody tr')).then(function(els) {
          expect(els.length).toBe(2);
        });
        expect(browser.findElement(by.css('.search-person')).getText()).toBe(randomName);
        expect(browser.getLocationAbsUrl()).toContain('person_ref');
      });

      it('should allow going back to full case list', function() {
        // reset search => assert that it goes back to full case list
        browser.findElement(by.cssContainingText('.search-person', randomName)).click();

        expect(browser.getLocationAbsUrl()).not.toContain('person_ref');
      });
    });
  });
})();
