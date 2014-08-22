/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      modelsRecipe = require('./_modelsRecipe'),
      utils = require('./_utils'),
      APP_BASE_URL = utils.APP_BASE_URL;

  describe('Operator Case Details', function (){
    // logs the user in before each test
    beforeEach(utils.setUp);

    function enterDetails (values, thirdparty) {
      var openSelector = '#personal_details .VCard-view',
          btnName = 'save-personal-details';

      if (thirdparty) {
        openSelector = '[name="add-thirdparty"]';
        btnName = 'save-thirdparty';
      }
      // open form
      browser.findElement(by.css(openSelector)).click();
      // enter values
      for (var name in values) {
        if (name == 'adaptations') {
          values[name].map(function (adaptation){
            browser.findElement(by.cssContainingText('[name="adaptations"] option', adaptation)).click();
          });
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
      browser.findElement(by.name(btnName)).click();
      utils.scrollTo(browser.findElement(by.id('personal_details')));
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

    describe('Non-existant Case', function (){
      it('should get case list when given non existant case reference', function (){
        browser.get(utils.APP_BASE_URL + 'XX-0000-0000/');

        expect(browser.getLocationAbsUrl()).toContain(utils.APP_BASE_URL);
        expect(browser.findElement(by.css('.Notice.error')).getInnerHtml()).toBe('The Case XX-0000-0000 could not be found!');
      });
    });

    describe('Create full case', function (){
      var caseRef,
          exemptReason = 'Client is in detention',
          mediaCode = 'DIAL UK',
          caseNotes = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec feugiat aliquet imperdiet. Integer id sem quis eros consectetur vulputate ut.';

      it('should create a case', function (){
        browser.findElement(by.buttonText('Create a case')).click();

        caseRef = element(by.binding('case.reference')).getText();
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());
      });

      it('should fill in case details', function (){
        browser.findElement(by.name('case.notes')).sendKeys(caseNotes);
        enterDetails({
          media_code: mediaCode,
          exempt_user: true,
          exempt_user_reason: exemptReason
        });
      });

      it('should fill in personal details', function (){
        enterDetails(modelsRecipe.Case.FULL_PERSONAL_DETAILS_FIELDS);
      });

      it('should fill in personal adaptations', function (){
        enterDetails(modelsRecipe.Case.FULL_ADAPTATIONS);
      });

      it('should fill in a third party', function (){
        enterDetails(
          utils.mergeObjects(modelsRecipe.Case.FULL_THIRDPARTY_PD_FIELDS, modelsRecipe.Case.FULL_THIRDPARTY_ADAPTATIONS),
          true
        );
      });

      it('should have stored all fields', function (){
        caseRef.then(function (text){
          browser.get(utils.APP_BASE_URL + text + '/');

          checkFields({
            personal_details: modelsRecipe.Case.FULL_PERSONAL_DETAILS_FIELDS,
            adaptations: modelsRecipe.Case.FULL_ADAPTATIONS,
            third_party: modelsRecipe.Case.FULL_THIRDPARTY_ADAPTATIONS
          });

          // case model hacks
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
