(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailAssign = {
      parent: 'case_detail.edit',
      name: 'case_detail.assign',
      url: 'assign/?as_of',
      views: {
        '@case_detail.edit': {
          templateUrl:'call_centre/case_detail.assign.html',
          controller: 'AssignProviderCtrl'
        }
      },
      onEnter: ['AssignProviderValidation', function (AssignProviderValidation) {
        AssignProviderValidation.setWarned(false);
      }],
      resolve: {
        // check that the eligibility check can be accessed
        CanAssign: ['AssignProviderValidation', '$q', 'diagnosis', 'eligibility_check', 'case', 'personal_details', 'History', function (AssignProviderValidation, $q, diagnosis, eligibility_check, $case, personal_details, History) {
          var deferred = $q.defer();
          var valid = AssignProviderValidation.validate({case: $case, personal_details: personal_details});

          if (!diagnosis.isInScopeTrue() || !eligibility_check.isEligibilityTrue()) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'The Case must be <strong>in scope</strong> and <strong>eligible</strong> to be assigned.',
              case: $case.reference,
              goto: 'case_detail.edit.diagnosis'
            });
          } else if (!valid && !AssignProviderValidation.getWarned()) {
            var assign_errors = AssignProviderValidation.getErrors();
            var assign_warnings = AssignProviderValidation.getWarnings();
            var previousState = History.previousState;

            deferred.reject({
              modal: true,
              title: 'Incomplete case',
              errors: assign_errors,
              warnings: assign_warnings,
              case: $case.reference,
              next: 'case_detail.assign',
              goto: previousState.name ? previousState.name : 'case_detail.edit'
            });
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        }],
        MatterTypes: ['MatterType', 'diagnosis', function (MatterType, diagnosis) {
          return MatterType.get({
            category__code: diagnosis.category
          }).$promise;
        }],
        Suggestions: ['case', '$stateParams', '$q', function ($case, $stateParams, $q) {
          var as_of = $stateParams.as_of;
          var deferred = $q.defer();

          $case.get_suggested_providers(as_of).success(function(data) {
            deferred.resolve(data);
          });
          return deferred.promise;
        }]
      }
    };

    mod.states = states;
  });
})();
