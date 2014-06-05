// APP
var operatorApp = angular.module('operatorApp', ['djangoRESTResources', 'ui.router']);

// STATES
var CaseListState = {
  url: '/operator/?search?sort',
  templateUrl: '/static/javascripts/app/partials/case_list.html',
  controller: 'CaseListCtrl'
};

var CaseDetailState = {
  abstract: true,
  url: '/operator/:caseref/',
  templateUrl: '/static/javascripts/app/partials/case_detail.html',
  controller: ['$scope', 'case', function($scope, $case){
    $scope.test= 123;
    $scope.case = $case;
  }],
  resolve: {
    'case': ['Case', '$stateParams', function(Case, $stateParams) {
      return Case.get({caseref: $stateParams.caseref});
    }]
  }
};

var CaseDetailEditState = {
  url: '',
  views: {
    '': {
      templateUrl: '/static/javascripts/app/partials/case_detail.edit.html',
      controller: ['$scope', function($scope){console.log('edit state loaded'+ JSON.stringify($scope.case))}]
    },
    'outcome': {
      templateUrl: '/static/javascripts/app/partials/case_detail.outcome.html',
      controller: ['$scope', function($scope){console.log('edit.outcome state loaded')}]
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

// SERVICES
operatorApp.factory('Case', ['$http', 'djResource', function($http, djResource) {
  var transformData = function(data, headers) {
    var fns = $http.defaults.transformRequest;

    if (angular.isFunction(fns))
      return fns(data, headers);

    angular.forEach(fns, function(fn) {
      data = fn(data, headers);
    });

    return data;
  }

  return djResource('/call_centre/proxy/case/:caseref/', {caseref:'@reference'}, {
    'personal_details_patch': {
      method:'PATCH',
      transformRequest: function(data, headers) {
        return transformData({"personal_details": data.personal_details}, headers);
      }
    }
  });
}]);

// CONTROLLERS
operatorApp.controller('CaseListCtrl', ['$scope', 'Case', '$location', function($scope, Case, $location) {
  $scope.search = $location.search().search || '';
  $scope.orderProp = $location.search().sort || '-created';

  Case.query({search: $scope.search}, function(data) {
    $scope.cases = data;
  });

  $scope.sortToggle = function(currentOrderProp){
    if (currentOrderProp === $scope.orderProp) {
      return '-' + currentOrderProp;
    }
    return currentOrderProp;
  };
}]);

operatorApp.controller('SearchCtrl', ['$scope', '$state', '$location', function($scope, $state, $location) {
  $scope.$on('$locationChangeSuccess', function(){
    $scope.search = $location.search().search || '';
  });

  $scope.submit = function() {
    $state.go('case_list', {search: $scope.search, sort:''});
  };

}]);

//ROUTES
operatorApp.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
      .state('case_list', CaseListState)
      .state('case_detail', CaseDetailState)
      .state('case_detail.edit', CaseDetailEditState);
});
