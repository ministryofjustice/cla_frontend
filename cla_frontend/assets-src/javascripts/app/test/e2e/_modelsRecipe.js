(function(){
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants');

  module.exports = {
    Case: {
      createRecipe: function(caseFields, personalDetailsFields, eligibilityCheckFields, diagnosisNodes) {

        function _createCase(el, caseFields, personalDetailsFields, eligibilityCheckFields, diagnosisNodes, callback) {
          var $el = document.querySelector(el),
              injector = angular.element($el).injector(),
              Case = injector.get('Case'),
              PersonalDetails = injector.get('PersonalDetails'),
              EligibilityCheck = injector.get('EligibilityCheck'),
              Diagnosis = injector.get('Diagnosis'),
              $case, $personalDetails, $eligibilityCheck, $diagnosis;

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

            function _completeDiagnosis(nodes, callback) {
              if (!nodes || !nodes.length) {
                return callback();
              }
              $diagnosis.current_node_id = nodes[0];
              $diagnosis
                .$move_down({case_reference: data.reference})
                .then(function () {
                  _completeDiagnosis(nodes.slice(1), callback);
                });
            }

            function _createDiagnosis() {
              $diagnosis = new Diagnosis({case_reference: data.reference});
              return $diagnosis.$save();
            }

            function _completeMeansTest() {
              $eligibilityCheck = new EligibilityCheck({
                case_reference: data.reference
              });

              if (eligibilityCheckFields) {
                eligibilityCheckFields = JSON.parse(eligibilityCheckFields);
                angular.forEach(eligibilityCheckFields, function(value, key) {
                  $eligibilityCheck[key] = value;
                });
              }

              return $eligibilityCheck.$save();
            }

            $personalDetails.$save().then(function() {
              // only create if diagnosis nodes present
              if (diagnosisNodes) {
                _createDiagnosis().then(function () {
                  _completeDiagnosis(diagnosisNodes, function () {
                    if (eligibilityCheckFields) {
                      _completeMeansTest().then(function () {
                        callback(data.reference);
                      });
                    } else {
                      callback(data.reference);
                    }
                  });
                });
              } else {
                callback(data.reference);
              }
            });
          });
        }

        return browser.driver.executeAsyncScript(
          _createCase, browser.rootEl, caseFields, personalDetailsFields, eligibilityCheckFields, diagnosisNodes
        );
      },

      createEmpty: function() {
        return this.createRecipe({}, {});
      },

      createWithRequiredFields: function() {
        return this.createRecipe(
          CONSTANTS.case.required,
          CONSTANTS.personal_details.required,
          CONSTANTS.eligibility.required
        );
      },

      createWithRequiredRecommendedFields: function() {
        return this.createRecipe(
          CONSTANTS.case.required,
          utils.mergeObjects(
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.eligibility.required
        );
      },

      createWithScopeAndEligibility: function(inScope, isEligible) {
        return this.createRecipe(
          CONSTANTS.case.required,
          utils.mergeObjects(
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          inScope ? CONSTANTS.eligibility[isEligible] : undefined,
          CONSTANTS.scope[inScope]
        );
      },

      createWithInScopeAndEligible: function () {
        return this.createWithScopeAndEligibility(true, true);
      },
      createWithOutScopeAndInEligible: function () {
        return this.createWithScopeAndEligibility(false, false);
      },
      createWithPartialMeansTest: function () {
        return this.createRecipe(
          this.DEFAULT_REQUIRED_CASE_FIELDS,
          utils.mergeObjects(this.DEFAULT_REQUIRED_PERSONAL_DETAILS_FIELDS,
            this.DEFAULT_RECOMMENDED_PERSONAL_DETAILS_FIELDS),
          this.PARTIAL,
          this.IN_SCOPE);
      }
    }
  };

  // function per_month(amount) {
  //   return {
  //     interval_period: 'per_month',
  //     per_interval_value: amount
  //   };
  // }

})();
