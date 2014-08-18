(function(){
  'use strict';

  var protractor = require('protractor');

  module.exports = {
    Case: {
      DEFAULT_REQUIRED_CASE_FIELDS: {
        notes: 'Case notes',
        media_code: 'AA'
      },

      DEFAULT_REQUIRED_ELIGIBILITY_CHECK_FIELDS: {
        category: 'debt'
      },

      DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS: {
        full_name: 'Foo Bar Quux',
        mobile_phone: '0123456789',
        dob: '01/01/2014'
      },

      DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS: {
        ni_number: '0123456789',
        postcode: 'F00 B4R',
        street: '1 Foo Bar'
      },

      createRecipe: function(caseFields, personalDetailsFields, eligibilityCheckFields) {
        function _createCase() {
          var el = document.querySelector(arguments[0]),
              caseFields = arguments[1],
              personalDetailsFields = arguments[2],
              eligibilityCheckFields = arguments[3],
              callback = arguments[arguments.length - 1],
              injector = angular.element(el).injector(),
              Case = injector.get('Case'),
              PersonalDetails = injector.get('PersonalDetails'),
              EligibilityCheck = injector.get('EligibilityCheck'),
              $case, $personalDetails, $eligibilityCheck;

          $case = new Case();

          angular.forEach(caseFields, function(value, key) {
            $case[key] = value;
          });

          $case.$save().then(function(data) {
            $personalDetails = new PersonalDetails({
              case_reference: data.reference
            });

            angular.forEach(personalDetailsFields, function(value, key) {
              $personalDetails[key] = value;
            });
            var dob = personalDetailsFields.dob || null;
            if (dob) {
              var parts = dob.split('/');
              $personalDetails.dob = {
                day: parts[0],
                month: parts[1],
                year: parts[2]
              };
            }

            $personalDetails.$save().then(function() {
              $eligibilityCheck = new EligibilityCheck({
                case_reference: data.reference
              });

              angular.forEach(eligibilityCheckFields, function(value, key) {
                $eligibilityCheck[key] = value;
              });

              $eligibilityCheck.$save().then(function() {
                callback(data.reference);
              });
            });
          });
        }

        return browser.driver.executeAsyncScript(
          _createCase, browser.rootEl, caseFields, personalDetailsFields, eligibilityCheckFields
        );
      },

      createEmpty: function() {
        return this.createRecipe({}, {});
      },

      createWithRequiredFields: function() {
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS,
          this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS,
          this.DEFAULT_REQUIRED_ELIGIBILITY_CHECK_FIELDS
        );
      },

      createWithRequiredRecommendedFields: function() {
        var pdFields = {};
        for (var key in this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS) {
          pdFields[key] = this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS[key];
        }
        for (var key in this.DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS) {
          pdFields[key] = this.DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS[key];
        }
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS, pdFields,
          this.DEFAULT_REQUIRED_ELIGIBILITY_CHECK_FIELDS
        );
      }
    }
  };

})();