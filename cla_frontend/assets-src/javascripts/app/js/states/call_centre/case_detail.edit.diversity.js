(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEditDiversity = {
      parent: 'case_detail.edit',
      name: 'case_detail.diversity',
      url: 'diversity/',
      views: {
        '@case_detail.edit': {
          templateUrl:'call_centre/case_detail.diversity.html',
          controller: 'DiversityCtrl'
        }
      },
      resolve: {
        // check that the eligibility check can be accessed
        CanAccess: ['$q', 'case', 'diagnosis', 'eligibility_check', function ($q, $case, diagnosis, eligibility_check) {
          var deferred = $q.defer();

          if (!diagnosis.isInScopeTrue() || !eligibility_check.isEligibilityTrue()) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'The Case must be <strong>in scope</strong> and <strong>eligible</strong> before completing the diversity questionnaire.',
              case: $case.reference,
              goto: 'case_detail.edit.diagnosis'
            });
          } else {
            deferred.resolve();
          }

          return deferred.promise;
        }],
      }
    };

    mod.states = states;
  });
})();
