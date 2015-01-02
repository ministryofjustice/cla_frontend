(function () {
  'use strict';

  var CONSTANTS = require('../protractor.constants'),
      utils = require('./_utils'),
      _ = require('lodash'),
      protractor = require('protractor'),
      ptor = protractor.getInstance();

  describe('case', function () {
    beforeEach(utils.setUp);

    describe('A non-existant Case', function () {
      it('should get case list when given non existant case reference', function () {
        browser.get(CONSTANTS.callcentreBaseUrl + 'XX-0000-0000/');
        expect(browser.getLocationAbsUrl()).toBe(ptor.baseUrl + CONSTANTS.callcentreBaseUrl);
      });
    });

    describe('A full case', function () {
      var caseRef,
          mediaCode = 'DIAL UK';

      it('should be created', function () {
        element(by.buttonText('Create a case')).click();

        caseRef = element(by.binding('case.reference'));
        expect(caseRef.isPresent()).toBe(true);
        expect(browser.getLocationAbsUrl()).toContain(caseRef.getText());
      });

      it('should fill in case details', function () {
        element(by.name('case.notes')).sendKeys(CONSTANTS.case.required.notes);
      });

      it('should fill in personal details and adaptations', function () {
        enterDetails(_.extend(
          {},
          CONSTANTS.personal_details.full,
          CONSTANTS.adaptations,
          {
            media_code: mediaCode,
            exempt_user: true,
            exempt_user_reason: CONSTANTS.case.remaining.exempt_user_reason
          }
        ));
      });

      it('should fill in a third party', function () {
        var thirdParty = _.extend({}, CONSTANTS.thirdparty, CONSTANTS.thirdparty.personal_details);
        delete thirdParty.personal_details;

        enterDetails(thirdParty, true);
      });

      it('should have stored all fields after reload', function () {
        utils.scrollTo(caseRef); // Firefox fix!
        caseRef.getText().then(function (text) {
          browser.get(CONSTANTS.callcentreBaseUrl + text + '/');

          checkFields({
            personal_details: CONSTANTS.personal_details.full,
            adaptations: CONSTANTS.adaptations,
            third_party: CONSTANTS.thirdparty
          });

          // case model patches
          var mediaCodeEl = element(by.css('[ng-if="case.media_code"]'));
          expect(mediaCodeEl.isPresent()).toBe(true);
          expect(mediaCodeEl.getText()).toContain(mediaCode);
          var exemptEl = element(by.css('[ng-if="case.exempt_user"]'));
          expect(exemptEl.isPresent()).toBe(true);
          expect(exemptEl.getText()).toContain(CONSTANTS.case.remaining.exempt_user_reason);
          expect(element(by.name('case.notes')).getAttribute('value')).toBe(CONSTANTS.case.required.notes);
        });
      });
    });
  });

  // helper methods
  function enterDetails (values, thirdparty) {
    var edit = '[name="create-newuser"]',
        viewCard = '#personal_details .VCard-view',
        btnName = 'save-personal-details',
        filterSelects = ['exempt_user_reason', 'language', 'media_code', 'reason', 'personal_relationship'];

    if (thirdparty) {
      edit = '[name="add-thirdparty"]';
      viewCard = '#third_party .VCard-view';
      btnName = 'save-thirdparty';
    }

    // open form
    utils.scrollTo(element(by.css(edit))); // Firefox fix!
    element(by.css(edit)).click();
    // enter values
    for (var name in values) {
      utils.scrollTo(element(by.name(name))); // Firefox fix!

      if (name === 'adaptations') {
        selectMultiOption(values[name], 's2id_autogen5');
        // values[name].map(selectMultiOption);
      } else if (name === 'spoke_to') {
        selectRadioOption(values[name], name);
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

  function selectRadioOption (value, field) {
    element(by.css('[name="' + field + '"][value="' + value + '"]')).click();
  }

  function selectMultiOption (options, fieldId) {
    var field = element(by.id(fieldId));
    field.click();

    for (var option in options) {
      field.sendKeys(options[option]);
      field.sendKeys(protractor.Key.ENTER);
    }
  }

  function checkFields (values) {
    for (var parent in values) {
      for (var model in values[parent]) {
        var value = values[parent][model],
            fullModel = parent + '.' + model;

        if (value === Object(value) && !(value instanceof Array)) {
          for (var val in value) {
            checkField(fullModel + '.' + val, value[val]);
          }
        } else {
          checkField(fullModel, value);
        }
      }
    }
  }

  function checkField (model, value) {
    var nonExact = [
      'personal_details.street',
      'third_party.personal_details.street',
      'adaptations.language',
      'third_party.reason',
      'third_party.personal_relationship'
    ];

    if (value === true) {
      expect(element(by.css('[ng-if="' + model + '"]')).isPresent()).toBe(true);
    } else if (model === 'adaptations.adaptations') {
      for (var i in value) {
        expect(element(by.css('[ng-if="selected_adaptations.length"]')).getText()).toContain(value[i]);
      }
    } else if (model === 'third_party.spoke_to') {
      expect(element(by.css('[ng-if="third_party.spoke_to === true || third_party.spoke_to === false"]')).getText()).toContain('has not spoken with client');
    } else if (nonExact.indexOf(model) > -1) {
      expect(element.all(by.binding(model)).get(0).getText()).toContain(value);
    } else {
      expect(element(by.exactBinding(model)).getText()).toContain(value);
    }
  }
})();
