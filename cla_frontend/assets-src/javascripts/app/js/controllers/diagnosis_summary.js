(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisSummaryCtrl',
      ['$scope', '$state',
        function($scope, $state) {
          $scope.delete = function() {
            $scope.diagnosis.$delete({'case_reference': $scope.case.reference}, function() {
              $scope.case.diagnosis = null;
              $state.go('case_detail.edit.diagnosis');
            });
          };
        }
      ]
    );
})();