'use strict';
(function() {
// STATES
  var states = angular.module('cla.states');
  states.Layout = {
    abstract: true,
    templateUrl: '/static/javascripts/app/partials/base.html'
  };

  states.CaseListState = {
    parent: states.Layout,
    url: '/operator/?search?ordering?page',
    templateUrl: '/static/javascripts/app/partials/case_list.html',
    controller: 'CaseListCtrl',
    resolve: {
      cases: ['$stateParams', 'Case', function($stateParams, Case){
        return Case.query({search: $stateParams.search, ordering: $stateParams.ordering, page: $stateParams.page}).$promise;
      }]
    }
  };

  states.CaseDetailState = {
    parent: states.Layout,
    abstract: true,
    url: '/operator/:caseref/',
    templateUrl: '/static/javascripts/app/partials/case_detail.html',
    controller: 'CaseDetailCtrl',
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
      }]
    }
  };

  states.CaseEditDetailState = {
    url: '',
    views: {
      '': {
        templateUrl: '/static/javascripts/app/partials/case_detail.edit.html',
        controller: 'CaseEditDetailCtrl'
      },
      'outcome': {
        templateUrl: '/static/javascripts/app/partials/case_detail.outcome.html'
      },
      'personalDetails': {
        templateUrl: '/static/javascripts/app/partials/case_detail.personal_details.html',
        controller: 'PersonalDetailsCtrl'
      }
    }
  };

  states.CaseEditDetailAssignState = {
    url: 'assign/',
    views: {
      '@case_detail': {
        templateUrl:'/static/javascripts/app/partials/case_detail.edit.assign.html',
        controller: 'AssignProviderCtrl'
      }
    }
  };


  states.CaseDetailDeclineSpecialistsState = {
    url: 'assign/decline_all/',
    views: {
      '@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.decline_specialists.html',
        controller: 'CaseDeclineSpecialistsCtrl'
      }
    }
  };

  states.CaseDetailDeferAssignmentState = {
    url: 'assign/defer/',
    views: {
      '@case_detail': {
        templateUrl: '/static/javascripts/app/partials/case_detail.defer_assignment.html',
        controller: 'CaseDeferSpecialistsCtrl'
      }
    }
  };

})();
