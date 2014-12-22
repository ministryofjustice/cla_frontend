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
        CanAccess: ['$q', 'case', function ($q, $case) {
          var deferred = $q.defer();

          if (!$case.personal_details) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'You must add the client\'s details before completing the diversity questionnaire.',
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
