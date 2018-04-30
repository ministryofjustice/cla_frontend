(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SetECFundCtrl',
    ['$scope', '$uibModalInstance', 'ECF_STATEMENT',
      function ($scope, $uibModalInstance, ECF_STATEMENT) {
        $scope.ecf_statements = ECF_STATEMENT;

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.save = function() {
          $scope.case.$patch().then(function () {
            $uibModalInstance.close();
          });

        };
      }
    ]
  );
})();
