(function(){
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants'),
      modelsRecipe = require('./_modelsRecipe');

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    describe('Case List', function () {
      var randomName = Math.random().toString(36).substring(7);

      function searchAndExpect(personQ, numResults) {
        element(by.css('#s2id_searchPerson a')).click();

        element(by.css('.select2-search input')).sendKeys(personQ);
        browser.driver.wait(function() {
          return element(by.css('.select2-no-results, .select2-result')).isPresent();
        }).then(function() {
          expect(element.all(by.css('.select2-results-dept-0')).count()).toBe(numResults);
        });
      }

      it('should filter by person', function() {

        modelsRecipe.Case.createRecipe({}, {
            full_name: randomName
          }
        ).then(function() {
          // go to list => assert num of rows > 1
          browser.get(CONSTANTS.callcentreBaseUrl);

          // findelement by random name and click on the name
          element(by.cssContainingText('a', randomName)).click();

          // assert that url changed and num of rows == 1
          element.all(by.css('.CaseList tbody tr')).then(function(els) {
            expect(els.length).toBe(1);
          });
          expect(element(by.css('.search-person')).getText()).toBe(randomName);
        });
      });

      it('should allow creating a Case for selected person', function() {
        // click on create new case for that person
        element(by.buttonText('Create a case for '+randomName)).click();

        // assert that personal details is filled in properly
        var caseRef = element(by.binding('case.reference'));
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());
        expect(element(by.css('#personal_details h2.Icon--user')).getText()).toBe(randomName);
      });

      it('should allow going back to case list for that person', function() {
        // click go back to case list
        element(by.cssContainingText('a','Back to cases')).click();

        // assert that we are still in multi cases per user list
        element.all(by.css('.CaseList tbody tr')).then(function(els) {
          expect(els.length).toBe(2);
        });
        expect(element(by.css('.search-person')).getText()).toBe(randomName);
        expect(browser.getLocationAbsUrl()).toContain('person_ref');
      });

      it('should allow going back to full case list', function() {
        // reset search => assert that it goes back to full case list
        element(by.cssContainingText('.search-person', randomName)).click();

        expect(browser.getLocationAbsUrl()).not.toContain('person_ref');
      });

      it('should allow searching for a person when creating a new case', function() {
        element(by.buttonText('Create a case')).click();

        browser.driver.wait(function() {
          return element(by.css('#s2id_searchPerson a'));
        }).then(function(select2Triggerer) {
          searchAndExpect('__invalid', 0);
          element(by.id('select2-drop-mask')).click();  // focus away to close the select
          searchAndExpect(randomName, 1);
        });
      });

      it('should allow cancelling a linking request', function() {
        element(by.css('.select2-results-dept-0')).click();

        browser.switchTo().alert().dismiss();
      });

      it('should allow linking a Person to a new case', function() {
        searchAndExpect(randomName, 1);
        
        element(by.css('.select2-results-dept-0')).click();

        browser.switchTo().alert().accept();

        expect(element(by.css('#personal_details h2.Icon--user')).getText()).toBe(randomName);
      });
    });
  });
})();
