'use strict';
(function(){
//ROUTES
  angular.module('cla.routes')
    .config(['AppSettings', '$stateProvider', '$locationProvider', 
    function(AppSettings, $stateProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      var states = angular.module('cla.states').getStates(AppSettings.BASE_URL);
      $stateProvider
        .state('layout', states.Layout)
        .state('case_list', states.CaseListState)
        .state('case_detail', states.CaseDetailState)
        .state('case_detail.edit', states.CaseEditDetailState)
        .state('case_detail.edit.eligibility', states.CaseEditDetailEligibilityState)
        .state('case_detail.edit.diagnosis', states.CaseEditDetailDiagnosisState)
        .state('case_detail.assign', states.CaseEditDetailAssignState)
        .state('case_detail.assign.complete', states.CaseEditDetailAssignCompleteState)
        .state('case_detail.defer_assignment', states.CaseDetailDeferAssignmentState)
        .state('case_detail.alternative_help', states.CaseEditDetailAlternativeHelpState);
    }]);
})();
