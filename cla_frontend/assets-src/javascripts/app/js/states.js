'use strict';
(function() {
// STATES
  var states = angular.module('cla.states');
  states.Layout = {
    abstract: true,
    templateUrl: '/static/javascripts/app/partials/base.html',
    controller: 'LayoutCtrl'
  };

  states.CaseListState = {
    parent: states.Layout,
    url: '/call_centre/?search?ordering?page',
    templateUrl: '/static/javascripts/app/partials/case_list.html',
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
        return case_.eligibility_check ? EligibilityCheck.get({ref: case_.eligibility_check}).$promise : new EligibilityCheck();
      }],
      personal_details: ['case', 'PersonalDetails', function(case_, PersonalDetails) {
        return case_.personal_details ? PersonalDetails.get({ref: case_.personal_details}).$promise : new PersonalDetails();
      }]
    },
    views: {
      '': {
        templateUrl: '/static/javascripts/app/partials/case_detail.html',
        controller: 'CaseDetailCtrl'
      },
      'outcome@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.outcome.html'
      },
      'personalDetails@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.personal_details.html',
        controller: 'PersonalDetailsCtrl'
      }
    }
  };

  states.CaseEditDetailState = {
    parent: states.CaseDetailState,
    url: '',
    views: {
      '@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.edit.html',
        controller: 'CaseEditDetailCtrl'
      }
    }
  };

  states.CaseEditDetailEligibilityState = {
    parent: states.CaseEditDetailState,
    url: 'eligibility/',
    views: {
      '@case_detail.edit': {
        templateUrl:'/static/javascripts/app/partials/case_detail.edit.eligibility.html',
        controller: 'EligibilityCheckCtrl'
      }
    }
  };

  states.CaseEditDetailAssignState = {
    parent: states.CaseDetailState,
    url: 'assign/',
    views: {
      '@case_detail': {
        templateUrl:'/static/javascripts/app/partials/case_detail.assign.html',
        controller: 'AssignProviderCtrl'
      }
    }
  };

  states.CaseEditDetailAssignCompleteState = {
    parent: states.CaseEditDetailAssignState,
    url: 'complete/',
    views: {
      '@case_detail': {
        templateUrl:'/static/javascripts/app/partials/case_detail.assign.complete.html',
        controller: 'AssignProviderCompleteCtrl'
      }
    }
  };

  states.CaseDetailDeclineSpecialistsState = {
    parent: states.CaseDetailState,
    url: 'assign/decline_all/',
    views: {
      '@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.decline_specialists.html',
        controller: 'CaseDeclineSpecialistsCtrl'
      }
    }
  };

  states.CaseDetailDeferAssignmentState = {
    parent: states.CaseDetailState,
    url: 'assign/defer/',
    views: {
      '@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.defer_assignment.html',
        controller: 'CaseDeferSpecialistsCtrl'
      }
    }
  };

})();
