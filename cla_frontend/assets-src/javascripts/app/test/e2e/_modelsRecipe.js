(function () {
  'use strict';

  var _ = require('lodash'),
      CONSTANTS = require('../protractor.constants');

  module.exports = {
    Case: {
      createRecipe: function (caseFields, personalDetailsFields, diagnosisNodes, eligibilityCheckFields) {

        function _createCase(el, caseFields, personalDetailsFields, diagnosisNodes, eligibilityCheckFields, callback) {
          var $el = document.querySelector(el),
              injector = angular.element($el).injector(),
              Case = injector.get('Case'),
              PersonalDetails = injector.get('PersonalDetails'),
              EligibilityCheck = injector.get('EligibilityCheck'),
              Diagnosis = injector.get('Diagnosis'),
              $case, $personalDetails, $eligibilityCheck, $diagnosis;

          $case = new Case();

          angular.forEach(caseFields, function (value, key) {
            $case[key] = value;
          });

          $case.$save().then(function (data) {
            if (personalDetailsFields) {
              $personalDetails = new PersonalDetails({
                case_reference: data.reference
              });

              angular.forEach(personalDetailsFields, function (value, key) {
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
                angular.forEach(eligibilityCheckFields, function (value, key) {
                  $eligibilityCheck[key] = value;
                });
              }

              return $eligibilityCheck.$save();
            }

            if (personalDetailsFields) {
              $personalDetails.$save().then(function () {
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
            } else {
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
            }
          });
        }

        return browser.driver.executeAsyncScript(
          _createCase, browser.rootEl, caseFields, personalDetailsFields, diagnosisNodes, eligibilityCheckFields
        );
      },

      createEmpty: function () {
        return this.createRecipe({}, null);
      },

      createEmptyWithPersonalDetails: function () {
        return this.createRecipe({}, {});
      },

      createWithRequiredFields: function () {
        return this.createRecipe(
          CONSTANTS.case.required,
          CONSTANTS.personal_details.required,
          CONSTANTS.scope.true,
          CONSTANTS.eligibility.true
        );
      },

      createWithRequiredRecommendedFields: function () {
        return this.createRecipe(
          CONSTANTS.case.required,
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope.true,
          CONSTANTS.eligibility.true
        );
      },

      createWithScope: function (inScope) {
        return this.createRecipe(
          CONSTANTS.case.required,
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope[inScope]
        );
      },

      createWithGroupedBenefits: function () {
        return this.createRecipe(
          CONSTANTS.case.required,
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope.true,
          CONSTANTS.eligibility.groupedBenefits
        );
      },

      createWithScopeAndEligibility: function (inScope, isEligible) {
        return this.createRecipe(
          CONSTANTS.case.required,
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope[inScope],
          inScope ? CONSTANTS.eligibility[isEligible] : undefined
        );
      },

      createEmptyWithInScopeAndEligible: function () {
        return this.createRecipe({}, {}, CONSTANTS.scope.true, CONSTANTS.eligibility.true);
      },

      createWithInScopeAndEligible: function () {
        return this.createWithScopeAndEligibility(true, true);
      },
      createWithOutScopeAndInEligible: function () {
        return this.createWithScopeAndEligibility(false, false);
      },

      createGroupedBenefitsReadyToAssign: function () {
        return this.createRecipe(
          _.extend(
            CONSTANTS.case.required,
            CONSTANTS.mattertypes.standard
          ),
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope.true,
          CONSTANTS.eligibility.groupedBenefits
        );
      },

      createSpecificBenefitsReadyToAssign: function () {
        return this.createRecipe(
          _.extend(
            CONSTANTS.case.required,
            CONSTANTS.mattertypes.standard
          ),
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope.true,
          CONSTANTS.eligibility.specificBenefits
        );
      },

      createReadyToAssign: function () {
        return this.createRecipe(
          _.extend(
            CONSTANTS.case.required,
            CONSTANTS.mattertypes.standard
          ),
          _.extend(
            {},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope.true,
          CONSTANTS.eligibility.true
        );
      },

      createForAllocationTest: function () {
        return this.createRecipe(
          _.extend({},
            CONSTANTS.case.required,
            CONSTANTS.mattertypes.housing
          ),
          _.extend({},
            CONSTANTS.personal_details.required,
            CONSTANTS.personal_details.recommended
          ),
          CONSTANTS.scope.allocation,
          CONSTANTS.eligibility.allocation
        );
      },

      createAndAssign: function (providerId) {
        return this.createReadyToAssign().then(function (case_ref) {
          function _assign(el, case_ref, providerId, callback) {
            var $el = document.querySelector(el),
                injector = angular.element($el).injector(),
                Case = injector.get('Case'),
                $case = new Case({reference: case_ref});

            $case.$assign({
              provider_id: providerId,
              is_manual: true,
              is_spor: false
            }).then(function () {
              callback(case_ref);
            }, function (data) {
              callback(data);
            });
          }

          return browser.driver.executeAsyncScript(
            _assign, browser.rootEl, case_ref, providerId
          );
        });
      }

    }
  };
})();
