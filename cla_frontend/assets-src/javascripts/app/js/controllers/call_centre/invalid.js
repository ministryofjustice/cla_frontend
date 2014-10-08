(function(){
  'use strict';


  angular.module('cla.controllers.operator')
    .controller('InvalidCtrl',
    ['$scope', '$modalInstance',
      function ($scope, $modalInstance) {
        $scope.close = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.proceed = function() {
          $modalInstance.close();
          $scope.case.warned = true;
          $scope.assign_to_provider();
        };
      }
    ]
  );
})();
