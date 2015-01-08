(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailDeferAssignment = {
      parent: 'case_detail',
      name: 'case_detail.defer_assignment',
      url: 'assign/defer/',
      views: {
        '@case_detail': {
          templateUrl: 'call_centre/case_detail.defer_assignment.html',
          controller: 'CaseDeferSpecialistsCtrl'
        }
      }
    };

    mod.states = states;
  });
})();
