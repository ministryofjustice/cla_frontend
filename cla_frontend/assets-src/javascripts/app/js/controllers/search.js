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
            var action = ($state.current.name.substring(0, 10) === 'complaints')? 'complaints_list' : 'case_list';
            $state.go(action, {search: $scope.search}, {inherit: false});
          };
        }
      ]
    );
})();
