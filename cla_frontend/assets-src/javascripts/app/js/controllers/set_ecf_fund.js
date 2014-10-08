(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SetECFundCtrl',
    ['$scope', '$modalInstance', 'ECF_STATEMENT',
      function ($scope, $modalInstance, ECF_STATEMENT) {
        $scope.ecf_statements = ECF_STATEMENT;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.save = function() {
          $scope.case.$patch().then(function () {
            $modalInstance.close();
          });

        };
      }
    ]
  );
})();
