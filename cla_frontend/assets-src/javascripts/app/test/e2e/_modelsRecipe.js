(function () {
  'use strict';

  var _ = require('lodash');
  var CONSTANTS = require('../protractor.constants');


  var createCase = function (el, caseFields, personalDetailsFields, diagnosisNodes, eligibilityCheckFields, callback) {
    var $el = document.querySelector(el),
        injector = angular.element($el).injector(),
        Case = injector.get('Case'),
        PersonalDetails = injector.get('PersonalDetails'),
        EligibilityCheck = injector.get('EligibilityCheck'),
        Diagnosis = injector.get('Diagnosis'),
        Q = injector.get('$q'),
        $case, $personalDetails, $eligibilityCheck, $diagnosis;

    // local methods
    var saveCaseFields = function () {
      $case = new Case();

      angular.forEach(caseFields, function (value, key) {
        $case[key] = value;
      });

      return $case.$save();
    };

    var savePersonalDetails = function (caseRef) {
      var deferred = Q.defer();

      if (personalDetailsFields) {
        $personalDetails = new PersonalDetails({
          case_reference: caseRef
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
        $personalDetails.$save().then(function () {
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    var createDiagnosis = function (caseRef) {
      var deferred = Q.defer();

      // only create if diagnosis nodes present
      if (diagnosisNodes) {
        $diagnosis = new Diagnosis({case_reference: caseRef});
        $diagnosis.$save().then(function () {
          // complete nodes
          completeDiagnosis($diagnosis, caseRef, diagnosisNodes, function () {
            deferred.resolve();
          });
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    var completeDiagnosis = function ($diagnosis, caseRef, nodes, callback) {
      if (!nodes || !nodes.length) {
        return callback();
      }

      $diagnosis.current_node_id = nodes[0];
      $diagnosis
        .$move_down({case_reference: caseRef})
        .then(function () {
          completeDiagnosis($diagnosis, caseRef, nodes.slice(1), callback);
        });
    };

    var completeMeansTest = function (caseRef) {
      var deferred = Q.defer();

      // only create if fields are present
      if (eligibilityCheckFields) {
        $eligibilityCheck = new EligibilityCheck({case_reference: caseRef});

        eligibilityCheckFields = JSON.parse(eligibilityCheckFields);
        angular.forEach(eligibilityCheckFields, function (value, key) {
          $eligibilityCheck[key] = value;
        });

        $eligibilityCheck.$save().then(function () {
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    saveCaseFields().then(function (data) {
      var caseRef = data.reference;

      savePersonalDetails(caseRef).then(function () {
        createDiagnosis(caseRef).then(function () {
          completeMeansTest(caseRef).then(function () {
            callback(data.reference);
          });
        });
      });
    });
  };

  module.exports = {
    Case: {
      createRecipe: function (caseFields, personalDetailsFields, diagnosisNodes, eligibilityCheckFields) {
        return browser.driver.executeAsyncScript(
          createCase, // function to call
          browser.rootEl, caseFields, personalDetailsFields, diagnosisNodes, eligibilityCheckFields // params
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
          CONSTANTS.scope.true_debt,
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
