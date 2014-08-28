/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      modelsRecipe = require('./_modelsRecipe'),
      utils = require('./_utils');

  // helper methods
  function enterDetails (values, thirdparty) {
    var edit = '#personal_details .VCard-view',
        viewCard = edit,
        btnName = 'save-personal-details',
        filterSelects = ['exempt_user_reason', 'language', 'media_code', 'reason', 'personal_relationship'];

    if (thirdparty) {
      edit = '[name="add-thirdparty"]';
      viewCard = '#personal_details .VCard-view';
      btnName = 'save-thirdparty';
    }

    // open form
    utils.scrollTo(element(by.css(edit))); // Firefox fix!
    element(by.css(edit)).click();
    // enter values
    for (var name in values) {
      utils.scrollTo(element(by.name(name))); // Firefox fix!

      if (name === 'adaptations') {
        values[name].map(selectOption);
      } else if (filterSelects.indexOf(name) > -1) {
        selectOption(values[name], name);
      } else if (name === 'dob') {
        var parts = values[name].split('/');
        utils.fillField('dob_day', parts[0]);
        utils.fillField('dob_month', parts[1]);
        utils.fillField('dob_year', parts[2]);
      } else {
        utils.fillField(name, values[name]);
      }
    }
    // save details
    element(by.name(btnName)).click();
    utils.scrollTo(element(by.css(viewCard))); // Firefox fix!
  }

  function selectOption (option, field) {
    // if not a string, will be adaptations
    field = typeof field === 'string' || field instanceof String ? field : 'adaptations';
    element(by.cssContainingText('[name="' + field + '"] option', option)).click();
  }

  function checkFields (values) {
    for (var parent in values) {
      for (var model in values[parent]) {
        var value = values[parent][model],
            fullModel = parent + '.' + model;

        if (value === true) {
          expect(element(by.css('[ng-show="' + fullModel + '"]')).isPresent()).toBe(true);
        } else if (model === 'adaptations') {
          for (var i in value) {
            expect(element(by.css('[ng-show="selected_adaptations.length"]')).getText()).toContain(value[i]);
          }
        } else {
          expect(element(by.binding(fullModel)).getText()).toContain(value);
        }
      }
    }
  }

  describe('Operator Case Details', function (){
    beforeEach(utils.setUp);

    describe('Non-existant Case', function (){
      it('should get case list when given non existant case reference', function (){
        browser.get(utils.APP_BASE_URL + 'XX-0000-0000/');

        expect(browser.getLocationAbsUrl()).toContain(utils.APP_BASE_URL);
        expect(element(by.css('.Notice.error')).getInnerHtml()).toBe('The Case XX-0000-0000 could not be found!');
      });
    });

    describe('Create full case', function (){
      var caseRef,
          exemptReason = '12 month exemption',
          mediaCode = 'DIAL UK',
          caseNotes = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec feugiat aliquet imperdiet. Integer id sem quis eros consectetur vulputate ut.';

      it('should create a case', function (){
        element(by.buttonText('Create a case')).click();

        caseRef = element(by.binding('case.reference'));
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());
      });

      it('should fill in case details', function (){
        element(by.name('case.notes')).sendKeys(caseNotes);
      });

      it('should fill in personal details and adaptations', function (){
        var personalDetails = utils.mergeObjects(
          modelsRecipe.Case.FULL_PERSONAL_DETAILS_FIELDS,
          modelsRecipe.Case.FULL_ADAPTATIONS,
          {
            media_code: mediaCode,
            exempt_user: true,
            exempt_user_reason: exemptReason
          }
        );
        enterDetails(personalDetails);
      });

      it('should fill in a third party', function (){
        enterDetails(
          utils.mergeObjects(modelsRecipe.Case.FULL_THIRDPARTY_PD_FIELDS, modelsRecipe.Case.FULL_THIRDPARTY_ADAPTATIONS),
          true
        );
      });

      it('should have stored all fields', function (){
        utils.scrollTo(caseRef); // Firefox fix!
        caseRef.getText().then(function (text){
          browser.get(utils.APP_BASE_URL + text + '/');

          checkFields({
            personal_details: modelsRecipe.Case.FULL_PERSONAL_DETAILS_FIELDS,
            adaptations: modelsRecipe.Case.FULL_ADAPTATIONS,
            third_party: modelsRecipe.Case.FULL_THIRDPARTY_ADAPTATIONS
          });

          // case model patches
          var mediaCodeEl = element(by.css('[ng-show="case.media_code"]'));
          expect(mediaCodeEl.isPresent()).toBe(true);
          expect(mediaCodeEl.getText()).toContain(mediaCode);
          var exemptEl = element(by.css('[ng-show="case.exempt_user"]'));
          expect(exemptEl.isPresent()).toBe(true);
          expect(exemptEl.getText()).toContain(exemptReason);
          expect(element(by.name('case.notes')).getAttribute('value')).toBe(caseNotes);
        });
      });
    });
  });
})();
