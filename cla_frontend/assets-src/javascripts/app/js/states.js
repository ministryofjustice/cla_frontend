'use strict';
(function() {
// STATES
  var states = angular.module('cla.states');
  states.Layout = {
    abstract: true,
    templateUrl: 'base.html',
    controller: 'LayoutCtrl'
  };

  states.CaseListState = {
    parent: states.Layout,
    url: '/call_centre/?search?ordering?page',
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

  states.CaseDetailState = {
    parent: states.Layout,
    abstract: true,
    url: '/call_centre/:caseref/',
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

  states.CaseEditDetailState = {
    parent: states.CaseDetailState,
    url: '',
    views: {
      '@case_detail': {
        templateUrl: 'case_detail.edit.html',
        controller: 'CaseEditDetailCtrl'
      }
    }
  };

  states.CaseEditDetailEligibilityState = {
    parent: states.CaseEditDetailState,
    url: 'eligibility/:section',
    views: {
      '@case_detail.edit': {
        templateUrl:'case_detail.edit.eligibility.html',
        controller: 'EligibilityCheckCtrl'
      }
    }
  };

  states.CaseEditDetailAssignState = {
    parent: states.CaseDetailState,
    url: 'assign/',
    views: {
      '@case_detail': {
        templateUrl:'case_detail.assign.html',
        controller: 'AssignProviderCtrl'
      }
    }
  };

  states.CaseEditDetailAlternativeHelpState = {
    parent: states.CaseDetailState,
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

  states.CaseEditDetailAssignCompleteState = {
    parent: states.CaseEditDetailAssignState,
    url: 'complete/',
    views: {
      '@case_detail': {
        templateUrl:'case_detail.assign.complete.html',
        controller: 'AssignProviderCompleteCtrl'
      }
    }
  };

  states.CaseDetailDeferAssignmentState = {
    parent: states.CaseDetailState,
    url: 'assign/defer/',
    views: {
      '@case_detail': {
        templateUrl: 'case_detail.defer_assignment.html',
        controller: 'CaseDeferSpecialistsCtrl'
      }
    }
  };

})();
