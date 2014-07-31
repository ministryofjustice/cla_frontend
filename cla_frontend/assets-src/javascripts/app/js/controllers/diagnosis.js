(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('DiagnosisCtrl',
      ['$scope',
        function($scope) {
          if (!$scope.case.diagnosis) {
            $scope.diagnosis.$save({
              'case_reference': $scope.case.reference
            }, function(data) {
              $scope.case.diagnosis = data.reference;
            });
          }

          $scope.moveDown = function() {
            $scope.diagnosis.$move_down({
              'case_reference': $scope.case.reference
            });
          };

          $scope.moveUp = function() {
            $scope.diagnosis.$move_up({
              'case_reference': $scope.case.reference
            });
          };
        }
      ]
    );
})();