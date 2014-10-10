(function(){
  'use strict';


  angular.module('cla.controllers.operator')
    .controller('InvalidCtrl',
    ['$scope', '$modalInstance', 'tplVars',
      function ($scope, $modalInstance, tplVars) {
        // template vars
        tplVars = angular.extend({
          'title': 'Missing information'
        }, tplVars);
        $scope.tplVars = tplVars;

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
