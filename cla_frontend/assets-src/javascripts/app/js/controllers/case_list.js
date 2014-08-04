(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseListCtrl',
      ['$rootScope', '$scope', 'cases', '$stateParams', '$state', 'Case',
        function($rootScope, $scope, cases, $stateParams, $state, Case) {
          $scope.orderProp = $stateParams.ordering || '-created';
          $scope.search = $stateParams.search;
          $scope.currentPage = $stateParams.page || 1;

          // hide guidance
          $scope.$emit('guidance:toggle', false);

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

          $scope.addCase = function() {
            $rootScope.$emit('timer:start', {
              success: function() {
                new Case().$save(function(data) {
                  $state.go('case_detail.edit', {caseref:data.reference});
                });
              }
            });
          };

          $scope.goToCase = function(case_reference) {
            $rootScope.$emit('timer:start', {
              success: function() {
                $state.go('case_detail.edit', {
                  'caseref': case_reference
                });
              }
            });
          };

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });
        }
      ]
    );
})();
