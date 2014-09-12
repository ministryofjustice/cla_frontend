(function(){
  'use strict';

  var utils = require('../e2e/_utils'),
    CONSTANTS = require('../protractor.constants.js'),
    modelsRecipe = require('./_modelsRecipe');

  describe('Specialist Multiple Cases', function() {

    function logout() {
      browser.findElement(by.cssContainingText('a[target="_self"]', 'Sign out')).click();
      protractor.getInstance().manage().deleteAllCookies();
    }

    var case_ref1,
        case_ref2,
        latest_op_case_ref,
        latest_sp_case_ref;

    describe('As Operator', function () {

      beforeEach(utils.setUp);

      it('should create cases as operator and assign then to a provider', function() {
        browser.get(CONSTANTS.callcentreBaseUrl);
        element(by.css('.CaseList tbody td a:first-child')).getText().then(function(case_ref) {
          latest_op_case_ref = case_ref;
        });

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
        var splitForm = element(by.css('.modal-content [name=split_case_frm]')),
            assignToProviderButton = splitForm.element(by.cssContainingText('button', 'Assign to'));

        // choose housing category
        fillInSplitForm(splitForm, 'housing');
        assignToProviderButton.click();

        // verify modal disappeared
        expect(splitForm.isPresent()).toBe(false);

        // verify outcome code REF-INT created
        expect(element(by.css('.CaseHistory-label:first-child')).getText()).toBe('REF-INT');

        // go to list and verify that new case created
        // browser.get(CONSTANTS.providerBaseUrl);
        // element(by.css('.CaseList tbody td a:first-child')).getText().then(function(new_case_ref1) {
        //   expect(new_case_ref1).not.toBe(case_ref1);
        //   latest_sp_case_ref = new_case_ref1;

        //   // go to that case and verify that outcome code 'created by specialist' exists
        //   browser.get('provider/'+new_case_ref1+'/');
        //   expect(element(by.cssContainingText('.CaseHistory-logItemNotes', 'Case created by Specialist')).isPresent()).toBe(true);
        // });
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

        // go to list and verify that no new case has been created
        // browser.get(CONSTANTS.providerBaseUrl);
        // element(by.css('.CaseList tbody td a:first-child')).getText().then(function(new_case_ref2) {
        //   expect(new_case_ref2).toBe(latest_sp_case_ref);
        // });

        // // go back to operator case list and verify that new case created
        // logout();
        // utils.setUp();
        // browser.get(CONSTANTS.callcentreBaseUrl);
        // element(by.css('.CaseList tbody tr:not(.is-rejected) a:first-child')).getText().then(function(case_ref) {
        //   expect(case_ref).not.toBe(latest_op_case_ref);
        // });        

      });
    });

    it('should logout', function () {
      this.after(function () {
        logout();
      });
    });
  });
})();
