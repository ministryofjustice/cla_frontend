(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisCtrl',
      ['$scope',
        function($scope) {
          if (!$scope.case.diagnosis) {
            // creates the diagnosis object if it doesn't exist
            $scope.diagnosis.$save({
              'case_reference': $scope.case.reference
            }, function(data) {
              $scope.case.diagnosis = data.reference;
            });
          }

          // updates the state of case.diagnosis_state after each save
          function saveCallback(data) {
            $scope.case.diagnosis_state = data.state;
          }

          $scope.moveDown = function() {
            $scope.diagnosis.$move_down({
              'case_reference': $scope.case.reference
            }, saveCallback);
          };

          $scope.moveUp = function() {
            $scope.diagnosis.$move_up({
              'case_reference': $scope.case.reference
            }, saveCallback);
          };
        }
      ]
    );
})();
