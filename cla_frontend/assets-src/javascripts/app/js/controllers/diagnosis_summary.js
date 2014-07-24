(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisSummaryCtrl',
      ['$scope',
        function($scope) {
          $scope.delete = function() {
            $scope.diagnosis.$delete({'case_reference': $scope.case.reference}, function() {
              $scope.case.diagnosis = null;
            });
          };
        }
      ]
    );
})();