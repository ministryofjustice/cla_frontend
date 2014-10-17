(function () {
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants'),
      modelsRecipe = require('./_modelsRecipe');

  // test elements
  var form = element(by.name('diagnosis-form')),
      scopeTab = element(by.cssContainingText('.Tabs-tabLink', 'Scope')),
      newBtn = element(by.name('diagnosis-new')),
      deleteBtn = element(by.name('diagnosis-delete')),
      nextBtn = element(by.name('diagnosis-next')),
      backBtn = element(by.name('diagnosis-back'));

  describe('scopeDiagnosis', function () {
    beforeEach(utils.setUp);

    describe('An operator', function () {
      it('should create and complete an in scope diagnosis', function () {
        modelsRecipe.Case.createEmpty().then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/diagnosis/');
          // create button present
          expect(newBtn.isPresent()).toBe(true);
          newBtn.click();
          // choices present
          expect(element(by.name('choice')).isPresent()).toBe(true);
          // correct buttons available
          expect(newBtn.isPresent()).toBe(false);
          expect(deleteBtn.isPresent()).toBe(false);
          expect(nextBtn.isPresent()).toBe(true);
          expect(backBtn.isPresent()).toBe(true);
        });
      });

      it('should be able to navigate forwards and backwards', function () {
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

      it('should complete an in scope diagnosis', function () {
        // correct fill full diagnosis
        fillDiagnosis(CONSTANTS.scope.true);

        expect(deleteBtn.isPresent()).toBe(true);
        expect(element(by.cssContainingText('a', 'Create financial assessment')).isPresent()).toBe(true);
        expect(scopeTab.getAttribute('class')).toContain('Icon--solidTick');
        // check category
        expect(element(by.css('[ng-if="category"]')).getText()).toContain('Family, marriage, separation and children');
      });

      it('should not delete a diagnosis on cancel', function () {
        deleteBtn.click();
        browser.switchTo().alert().dismiss();

        expect(scopeTab.isPresent()).toBe(true);
        expect(scopeTab.getAttribute('class')).toContain('Icon--solidTick');
      });

      it('should delete a scope diagnosis on ok', function () {
        deleteBtn.click();
        browser.switchTo().alert().accept();

        expect(scopeTab.isPresent()).toBe(true);
        expect(scopeTab.getAttribute('class')).not.toContain('Icon');
      });

      it('should create an out of scope diagnosis', function () {
        newBtn.click();
        fillDiagnosis(CONSTANTS.scope.false);

        expect(scopeTab.isPresent()).toBe(true);
        expect(scopeTab.getAttribute('class')).toContain('Icon--solidCross');
      });
    });
  });

  // helpers
  function fillDiagnosis (nodes) {
    for (var node in nodes) {
      utils.scrollTo(scopeTab);
      element(by.css('[name="choice"][value="' + nodes[node] + '"]')).click();
      element(by.name('diagnosis-next')).click();
    }
  }
})();
