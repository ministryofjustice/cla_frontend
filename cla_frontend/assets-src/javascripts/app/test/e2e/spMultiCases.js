(function(){
  'use strict';

  var utils = require('../e2e/_utils'),
    modelsRecipe = require('./_modelsRecipe');

  describe('Specialist Multiple Cases', function() {

    function logout() {
      element(by.css('.UserMenu-toggle')).click();
      element(by.cssContainingText('a[target="_self"]', 'Sign out')).click();
      protractor.getInstance().manage().deleteAllCookies();
    }

    var case_ref1,
        case_ref2;

    describe('As Operator', function () {

      beforeEach(utils.setUp);

      it('should create cases as operator and assign then to a provider', function() {
        modelsRecipe.Case.createAndAssign(1).then(function(reference) {
          case_ref1 = reference;
        });

        modelsRecipe.Case.createAndAssign(1).then(function(reference) {
          case_ref2 = reference;
        });

      });

      it('should logout', function () {
        this.after(function () {
          logout();
        });
      });
    });


    describe('As Provider', function () {
      beforeEach(utils.setUpAsProvider);

      function fillInSplitForm(splitForm, categoryVal) {
        var categorySelect = splitForm.element(by.css('[name=category]')),
            matterType1Select = splitForm.element(by.css('[name=matter_type1]')),
            matterType2Select = splitForm.element(by.css('[name=matter_type2]'));

        categorySelect.element(by.css('option[value="'+categoryVal+'"]')).click();
        matterType1Select.element(by.css('option:last-child')).click();
        matterType2Select.element(by.css('option:last-child')).click();
        splitForm.element(by.css('[name=notes]')).sendKeys('Notes');
      }

      it('shouldnt\'t be able to split if the validation fails', function() {
        browser.get('provider/'+case_ref1+'/');

        var splitButton = element(by.cssContainingText('.Button.Button--secondary', 'Split')),
            splitForm = element(by.css('.modal-content [name=split_case_frm]')),
            assignToProviderButton = splitForm.element(by.cssContainingText('button', 'Assign to'));

        expect(splitButton.isDisplayed()).toBe(true);
        splitButton.click();        
        expect(splitForm.isDisplayed()).toBe(true);

        // submit without filling in any data => validation error
        assignToProviderButton.click();
        expect(splitForm.isDisplayed()).toBe(true);

        // choose same category of law and submit => validation error
        fillInSplitForm(splitForm, 'family');
        assignToProviderButton.click();
        expect(splitForm.isDisplayed()).toBe(true);

        // choose a category of law that the provider can't deal with and assign to same provider => validation error
        fillInSplitForm(splitForm, 'benefits');
        assignToProviderButton.click();
        expect(splitForm.isDisplayed()).toBe(true);
      });

      it('should be able to split a case and assign it to same provider if they can deal with that category of law', function() {
        var splitButton = element(by.cssContainingText('.Button.Button--secondary', 'Split')),
            splitForm = element(by.css('.modal-content [name=split_case_frm]')),
            assignToProviderButton = splitForm.element(by.cssContainingText('button', 'Assign to'));

        // choose housing category
        fillInSplitForm(splitForm, 'housing');
        assignToProviderButton.click();

        // verify modal disappeared
        expect(splitForm.isPresent()).toBe(false);

        // verify outcome code REF-INT created
        expect(element(by.css('.CaseHistory-label:first-child')).getText()).toBe('REF-INT');

        // try to split again => validation error
        expect(splitButton.isDisplayed()).toBe(true);
        splitButton.click();
        fillInSplitForm(splitForm, 'housing');
        assignToProviderButton.click();
        expect(splitForm.isDisplayed()).toBe(true);
        expect(
          splitForm.element(by.cssContainingText('.Error-message', 'This Case has already been split')).isDisplayed()
        ).toBe(true);
      });

      it('should be able to split a case and assign it back to an operator', function() {
        browser.get('provider/'+case_ref2+'/');

        var splitButton = element(by.cssContainingText('.Button.Button--secondary', 'Split')),
            splitForm = element(by.css('.modal-content [name=split_case_frm]')),
            assignToOperatorButton = splitForm.element(by.cssContainingText('button', 'Send to operator'));

        expect(splitButton.isDisplayed()).toBe(true);
        splitButton.click();        
        expect(splitForm.isDisplayed()).toBe(true);

        // choose benefits category
        fillInSplitForm(splitForm, 'benefits');
        assignToOperatorButton.click();

        // verify modal disappeared
        expect(splitForm.isPresent()).toBe(false);

        // verify outcome code REF-EXT created
        expect(element(by.css('.CaseHistory-label:first-child')).getText()).toBe('REF-EXT');      

        // try to split again => validation error
        expect(splitButton.isDisplayed()).toBe(true);
        splitButton.click();
        fillInSplitForm(splitForm, 'benefits');
        assignToOperatorButton.click();
        expect(splitForm.isDisplayed()).toBe(true);
        expect(
          splitForm.element(by.cssContainingText('.Error-message', 'This Case has already been split')).isDisplayed()
        ).toBe(true);

        // dismiss the modal
        splitForm.element(by.cssContainingText('a', 'Cancel')).click();
      });
    });

    it('should logout', function () {
      this.after(function () {
        logout();
      });
    });
  });
})();
