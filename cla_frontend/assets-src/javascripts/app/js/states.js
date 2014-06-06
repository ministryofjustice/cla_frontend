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
    url: '/operator/?search?sort',
    templateUrl: '/static/javascripts/app/partials/case_list.html',
    controller: 'CaseListCtrl'
  };

  states.CaseDetailState = {
    parent: states.Layout,
    abstract: true,
    url: '/operator/:caseref/',
    templateUrl: '/static/javascripts/app/partials/case_detail.html',
    controller: ['$scope', 'case', function($scope, $case){
      $scope.case = $case;
    }],
    resolve: {
      'case': ['Case', '$stateParams', function(Case, $stateParams) {
        return Case.get({caseref: $stateParams.caseref});
      }]
    }
  };

  states.CaseEditDetailState = {
    url: '',
    views: {
      '': {
        templateUrl: '/static/javascripts/app/partials/case_detail.edit.html',
        controller: ['$scope', 'Category', 'EligibilityCheck', function($scope, Category, EligibilityCheck){
          $scope.category_list = Category.query();

          $scope.case.$then(function(data) {
            $scope.eligibility_check = EligibilityCheck.get({ref: data.resource.eligibility_check});
          });

          $scope.submit = function(){
            $scope.case.$case_details_patch();
          };
        }]
      },
      'outcome': {
        templateUrl: '/static/javascripts/app/partials/case_detail.outcome.html',
        controller: ['$scope', function($scope){console.log('edit.outcome state loaded');}]
      },
      'personalDetails': {
        templateUrl: '/static/javascripts/app/partials/case_detail.personal_details.html',
        controller: ['$scope', function($scope){
          $scope.submit = function(){
            $scope.case.$personal_details_patch();
          };
        }]
      }
    }
  };
})();
