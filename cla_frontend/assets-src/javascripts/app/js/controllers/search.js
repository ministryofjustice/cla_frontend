(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SearchCtrl',
      ['$scope', '$state', '$location',
        function($scope, $state, $location) {
          $scope.$on('$locationChangeSuccess', function(){
            $scope.search = $location.search().search || '';
          });

          $scope.submit = function() {
            $state.go('case_list', {search: $scope.search, ordering:'', page: 1});
          };
        }
      ]
    );
})();