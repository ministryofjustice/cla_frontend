/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      modelsRecipe = require('./_modelsRecipe'),
      utils = require('./_utils');

  function fillDiagnosis (nodes) {
    for (var node in nodes) {
      utils.scrollTo(element(by.cssContainingText('.Tabs-tabLink', 'Scope diagnosis')));
      element(by.css('[name="choice"][value="' + nodes[node] + '"]')).click();
      element(by.name('diagnosis-next')).click();
    }
  }

  describe('Operator Scope Diagnosis', function (){
    beforeEach(utils.setUp);

    describe('Scope diagnosis', function () {
      var form = element(by.name('diagnosis-form')),
          newBtn = element(by.name('diagnosis-new')),
          deleteBtn = element(by.name('diagnosis-delete')),
          nextBtn = element(by.name('diagnosis-next')),
          backBtn = element(by.name('diagnosis-back'));

      it('should create and complete an in scope diagnosis', function (){
        modelsRecipe.Case.createEmpty().then(function(caseRef) {
          browser.get(utils.APP_BASE_URL + caseRef + '/diagnosis/');
          // create button present
          expect(newBtn.isDisplayed()).toBe(true);
          newBtn.click();
          // choices present
          expect(element(by.name('choice')).isPresent()).toBe(true);
          // correct buttons available
          expect(newBtn.isDisplayed()).toBe(false);
          expect(deleteBtn.isDisplayed()).toBe(false);
          expect(nextBtn.isDisplayed()).toBe(true);
          expect(backBtn.isDisplayed()).toBe(true);
        });
      });

      it('should be able to navigate forwards and backwards', function (){
        // check can go forwards and then back
        var firstNode = element(by.css('[name="choice"][value="n2"]'));
        firstNode.click();
        utils.scrollTo(form); // Firefox fix!
        nextBtn.click();
        expect(firstNode.isPresent()).toBe(false);
        utils.scrollTo(form); // Firefox fix!
        backBtn.click();
        expect(firstNode.isPresent()).toBe(true);
      });

      it('should complete an in scope diagnosis', function (){
        // correct fill full diagnosis
        fillDiagnosis(modelsRecipe.Case.IN_SCOPE);

        expect(deleteBtn.isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('a', 'Create financial assessment')).isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--solidTick', 'Scope diagnosis')).isPresent()).toBe(true);
        // check category
        expect(element(by.css('[ng-show="category"]')).getText()).toContain('Family, marriage, separation and children');
      });

      it('should not delete a diagnosis on cancel', function (){
        deleteBtn.click();
        browser.switchTo().alert().dismiss();

        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--solidTick', 'Scope diagnosis')).isPresent()).toBe(true);
      });

      it('should delete a scope diagnosis on ok', function (){
        deleteBtn.click();
        browser.switchTo().alert().accept();

        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--info', 'Scope diagnosis')).isPresent()).toBe(true);
      });

      it('should create an out of scope diagnosis', function (){
        newBtn.click();
        fillDiagnosis(modelsRecipe.Case.OUT_SCOPE);

        expect(element(by.cssContainingText('.Tabs-tabLink.Icon--solidCross', 'Scope diagnosis')).isPresent()).toBe(true);
      });
    });
  });
})();
