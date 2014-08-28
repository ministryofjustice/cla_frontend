/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      modelsRecipe = require('./_modelsRecipe'),
      utils = require('./_utils');

  function fillDiagnosis (nodes) {
    for (var node in nodes) {
      utils.scrollTo(browser.findElement(by.cssContainingText('.Tabs-tabLink', 'Scope diagnosis')));
      browser.findElement(by.css('[name="choice"][value="' + nodes[node] + '"]')).click();
      browser.findElement(by.name('diagnosis-next')).click();
    }
  }

  describe('Operator Scope Diagnosis', function (){
    // logs the user in before each test
    beforeEach(utils.setUp);

    describe('Scope diagnosis', function () {
      it('should create and complete an in scope diagnosis', function (){
        modelsRecipe.Case.createEmpty().then(function(caseRef) {
          browser.get(utils.APP_BASE_URL + caseRef + '/diagnosis/');
          // create button present
          expect(element(by.name('diagnosis-new')).isDisplayed()).toBe(true);
          browser.findElement(by.name('diagnosis-new')).click();
          // choices present
          expect(element(by.name('choice')).isPresent()).toBe(true);
          // correct buttons available
          expect(element(by.name('diagnosis-new')).isDisplayed()).toBe(false);
          expect(element(by.name('diagnosis-delete')).isDisplayed()).toBe(false);
          expect(element(by.name('diagnosis-next')).isDisplayed()).toBe(true);
          expect(element(by.name('diagnosis-back')).isDisplayed()).toBe(true);

          fillDiagnosis(modelsRecipe.Case.IN_SCOPE);

          expect(element(by.name('diagnosis-delete')).isDisplayed()).toBe(true);
          expect(element(by.cssContainingText('a', 'Create financial assessment')).isDisplayed()).toBe(true);
          expect(element(by.cssContainingText('.Tabs-tabLink.Icon--solidTick', 'Scope diagnosis')).isPresent()).toBe(true);
          // check category
          expect(element(by.css('[ng-show="category"]')).getText()).toContain('Family, marriage, separation and children');
        });
      });

      it('should not delete a diagnosis on cancel', function (){
        browser.findElement(by.name('diagnosis-delete')).click();
        browser.switchTo().alert().dismiss();

        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--solidTick', 'Scope diagnosis')).isPresent()).toBe(true);
      });

      it('should delete a scope diagnosis on ok', function (){
        browser.findElement(by.name('diagnosis-delete')).click();
        browser.switchTo().alert().accept();

        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--info', 'Scope diagnosis')).isPresent()).toBe(true);
      });

      it('should create an out of scope diagnosis', function (){
        browser.findElement(by.name('diagnosis-new')).click();
        fillDiagnosis(modelsRecipe.Case.OUT_SCOPE);

        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--solidCross', 'Scope diagnosis')).isPresent()).toBe(true);
      });
    });
  });
})();
