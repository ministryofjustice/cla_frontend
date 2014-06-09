'use strict';

(function(){
// CONTROLLERS
  angular.module('cla.controllers')
    .controller('CaseListCtrl', ['$scope', 'Case', '$location', function($scope, Case, $location) {
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


  angular.module('cla.controllers').controller('CaseCtrl', ['$scope', '$state', 'Case', function($scope, $state, Case) {

    $scope.addCase = function() {
      new Case().$save(function(data) {
        //console.log(data.reference);
        $state.go('case_detail.edit', {caseref:data.reference});
      });

    };
  }]);


  angular.module('cla.controllers')
    .controller('SearchCtrl', ['$scope', '$state', '$location', function($scope, $state, $location) {
      $scope.$on('$locationChangeSuccess', function(){
        $scope.search = $location.search().search || '';
      });

      $scope.submit = function() {
        $state.go('case_list', {search: $scope.search, sort:''});
      };

    }]);

})();