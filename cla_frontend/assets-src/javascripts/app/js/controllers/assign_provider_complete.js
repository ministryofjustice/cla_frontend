(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('AssignProviderCompleteCtrl',
      ['$scope', 'Provider',
        function($scope, Provider) {
          $scope.selected_provider = Provider.get({id: $scope.case.provider});
        }
      ]
    );
})();