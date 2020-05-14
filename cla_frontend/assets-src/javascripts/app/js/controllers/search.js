(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SearchCtrl',
      ['$scope', '$state', '$location',
        function($scope, $state, $location) {
          $scope.$on('$locationChangeSuccess', function(){
            var searchList = ($state.current.name.indexOf('complaint') !== -1)? 'complaints' : 'cases';
            var $searchElement = angular.element(document.getElementById('case-search'));
            $searchElement.attr('placeholder', 'Search ' + searchList);
            $scope.search = $location.search().search || '';
          });

          $scope.submit = function() {
            var action = ($state.current.name.indexOf('complaint') !== -1)? 'complaints_list' : 'case_list';
            $state.go(action, {search: $scope.search}, {inherit: false, location: false});

          };
        }
      ]
    );
})();
