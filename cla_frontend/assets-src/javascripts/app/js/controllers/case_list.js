(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseListCtrl',
      ['$rootScope', '$scope', 'cases', '$stateParams', '$state',
        function($rootScope, $scope, cases, $stateParams, $state) {
          $scope.orderProp = $stateParams.ordering || '-created';
          $scope.search = $stateParams.search;
          $scope.currentPage = $stateParams.page || 1;

          $scope.cases = cases;

          function updatePage() {
            $state.go('case_list', {
              'page': $scope.currentPage,
              'ordering': $scope.orderProp,
              'search': $scope.search
            });
          }

          $scope.pageChanged = function(newPage) {
            $scope.currentPage = newPage;
            updatePage();
          };

          $scope.sortToggle = function(currentOrderProp){
            if (currentOrderProp === $scope.orderProp) {
              $scope.orderProp = '-' + currentOrderProp;
            } else {
              $scope.orderProp = currentOrderProp;
            }
            updatePage();
          };

          $rootScope.$emit('timer:check');
        }
      ]
    );
})();
