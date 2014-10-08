(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SetMatterTypeCtrl',
    ['$scope', '$modalInstance', 'matter_types', '$state',
      function ($scope, $modalInstance, matter_types, $state) {
        $scope.matter_types = matter_types;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
          $scope.case.matter_type1 = null;
          $scope.case.matter_type2 = null;
        };

        $scope.save = function() {
          $scope.case.$set_matter_types().then(function () {
            $modalInstance.close();
            if ($scope.next) {
              $state.go($scope.next);
            }
          });

        };
      }
    ]
  );
})();
