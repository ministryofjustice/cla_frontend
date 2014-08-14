'use strict';
(function() {
// STATES
  var states = angular.module('cla.states'),
    operatorStates = angular.module('cla.states.operator'),
    providerStates = angular.module('cla.states.provider');

  states.getStates = function(APP_BASE_URL) {
    var defs = {};

    defs.Layout = {
      name: 'layout',
      abstract: true,
      templateUrl: 'base.html',
      controller: 'LayoutCtrl'
    };

    defs.CaseListState = {
      name: 'case_list',
      parent: 'layout',
      url: APP_BASE_URL+'?search?ordering?page',
      templateUrl: 'case_list.html',
      controller: 'CaseListCtrl',
      resolve: {
        cases: ['$stateParams', 'Case', function($stateParams, Case){
          var params = {
            search: $stateParams.search,
            ordering: $stateParams.ordering,
            page: $stateParams.page
          };

          // by default, if no search params is defined, get dashboard cases
          // this can be easily customised by backend
          if (!params.search) {
            params.dashboard = 1;
          }

          return Case.query(params).$promise;
        }]
      }
    };

    defs.CaseDetailState = {
      parent: 'layout',
      name: 'case_detail',
      abstract: true,
      url: APP_BASE_URL+':caseref/',
      resolve: {
        'case': ['Case', '$stateParams', '$state', 'flash', function(Case, $stateParams, $state, flash) {
          return Case.get({caseref: $stateParams.caseref}, {},
              function(){},
              function(response){
                if (response.status === 404) {
                  flash('error', 'The Case '+$stateParams.caseref+' could not be found!');
                  $state.go('case_list');
                }
              }
          ).$promise;
        }],
        eligibility_check: ['case', 'EligibilityCheck', function(case_, EligibilityCheck){
          return case_.eligibility_check ? EligibilityCheck.get({case_reference: case_.reference}).$promise : new EligibilityCheck({case_reference: case_.reference});
        }],
        diagnosis: ['case', 'Diagnosis', function(case_, Diagnosis){
          return case_.diagnosis ? Diagnosis.get({case_reference: case_.reference}).$promise : new Diagnosis({case_reference: case_.reference});
        }],
        personal_details: ['case', 'PersonalDetails', function(case_, PersonalDetails) {
          return case_.personal_details ? PersonalDetails.get({case_reference: case_.reference}).$promise : new PersonalDetails({case_reference: case_.reference});
        }],
        adaptation_details: ['case', 'Adaptations', function(case_, Adaptations) {
          return case_.adaptation_details ? Adaptations.get({case_reference: case_.reference}).$promise : new Adaptations({case_reference: case_.reference});
        }],
        adaptations_metadata: ['AdaptationsMetadata', function(AdaptationsMetadata) {
          return AdaptationsMetadata.options().$promise;
        }],
        thirdparty_details: ['case', 'ThirdParty', function(case_, ThirdParty) {
          return case_.thirdparty_details ? ThirdParty.get({case_reference: case_.reference}).$promise : new ThirdParty({case_reference: case_.reference});
        }],
        mediacodes: ['MediaCode', function(MediaCode) {
          return MediaCode.get().$promise;
        }],
      },
      views: {
        '': {
          templateUrl: 'case_detail.html',
          controller: 'CaseDetailCtrl'
        },
        'outcome@case_detail': {
          templateUrl: 'case_detail.outcome.html'
        },
        'personalDetails@case_detail': {
          templateUrl: 'case_detail.personal_details.html',
          controller: 'PersonalDetailsCtrl'
        }
      }
    };

    defs.CaseEditDetailState = {
      parent: 'case_detail',
      name: 'case_detail.edit',
      url: '',
      views: {
        '@case_detail': {
          templateUrl: 'case_detail.edit.html',
          controller: 'CaseEditDetailCtrl'
        }
      }
    };

    defs.CaseEditDetailEligibilityState = {
      parent: 'case_detail.edit',
      name: 'case_detail.edit.eligibility',
      url: 'eligibility/?section',
      onEnter: ['eligibility_check', 'diagnosis', 'flash', 'EligibilityCheckService',
        function(eligibility_check, diagnosis, flash, EligibilityCheckService){
          EligibilityCheckService.onEnter(eligibility_check, diagnosis, flash);
        }],
      views: {
        '@case_detail.edit': {
          templateUrl:'case_detail.edit.eligibility.html',
          controller: 'EligibilityCheckCtrl'
        }
      }
    };

    defs.CaseEditDetailDiagnosisState = {
      parent: 'case_detail.edit',
      name: 'case_detail.edit.diagnosis',

      url: 'diagnosis/',
      views: {
        '@case_detail.edit': {
          templateUrl:'case_detail.edit.diagnosis.html',
          controller: 'DiagnosisCtrl'
        }
      }
    };

    defs.CaseEditDetailAlternativeHelpState = {
      parent: 'case_detail',
      name: 'case_detail.alternative_help',
      url: 'alternative_help/?keyword?category?page',
      views: {
        '@case_detail': {
          templateUrl:'case_detail.alternative_help.html',
          controller: 'AlternativeHelpCtrl'
        }
      },
      resolve: {
        kb_providers: ['$stateParams', 'KnowledgeBase', function($stateParams, KnowledgeBase){
          var params = {
            search: $stateParams.keyword,
            article_category: $stateParams.category,
            page: $stateParams.page
          };
          return KnowledgeBase.get(params).$promise;
        }],
        kb_categories: ['KnowledgeBaseCategories', function(KnowledgeBaseCategories){
          return KnowledgeBaseCategories.get().$promise;
        }]
      }
    };

    return defs;
  };


  operatorStates.getStates = function(APP_BASE_URL){
    var operatorStates = states.getStates(APP_BASE_URL);

    operatorStates.CaseListState.templateUrl = 'call_centre/case_list.html';

    operatorStates.CaseDetailState.views[''].templateUrl = 'call_centre/case_detail.html';

    operatorStates.CaseEditDetailState.views['@case_detail'].templateUrl = 'call_centre/case_detail.edit.html';

    operatorStates.CaseEditDetailAssignState = {
      parent: 'case_detail',
      name: 'case_detail.assign',
      url: 'assign/?as_of',
      views: {
        '@case_detail': {
          templateUrl:'call_centre/case_detail.assign.html',
          controller: 'AssignProviderCtrl'
        }
      }
    };

    operatorStates.CaseEditDetailAssignCompleteState = {
      parent: 'case_detail.assign',
      name: 'case_detail.assign.complete',
      url: 'complete/',
      views: {
        '@case_detail': {
          templateUrl:'call_centre/case_detail.assign.complete.html',
          controller: 'AssignProviderCompleteCtrl'
        }
      }
    };

    operatorStates.CaseDetailDeferAssignmentState = {
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

    return operatorStates;
  };

  providerStates.getStates = function(APP_BASE_URL){
    var providerStates = states.getStates(APP_BASE_URL);

    providerStates.CaseEditDetailState.views['acceptReject@case_detail.edit'] = {
      templateUrl: 'provider/includes/case_detail.edit.acceptreject.html',
      controller: 'AcceptRejectCaseCtrl'
    };

    providerStates.CaseDetailState.views[''].templateUrl = 'provider/case_detail.html';

    providerStates.CaseEditDetailState.views['@case_detail'].templateUrl = 'provider/case_detail.edit.html';
    return providerStates;
  };

})();

