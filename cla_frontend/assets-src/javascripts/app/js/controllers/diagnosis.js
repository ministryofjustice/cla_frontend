(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisCtrl',
      ['$scope',
        function($scope) {
          // updates the state of case.diagnosis_state after each save
          function saveCallback(data) {
            $scope.case.diagnosis_state = data.state;
            if (!$scope.diagnosis.isInScopeUnknown()) {
              $scope.logManager.refresh();  // refreshing the logs
            }
          }

          // creates a new diagnosis
          $scope.createDiagnosis = function () {
            if (!$scope.case.diagnosis) {
              // creates the diagnosis object if it doesn't exist
              $scope.diagnosis.$save({
                'case_reference': $scope.case.reference
              }, function(data) {
                $scope.case.diagnosis = data.reference;
              });
            }
          };

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

          $scope.diagnosisTitleClass = function () {
            return $scope.diagnosis.isInScopeTrue() ? 'Icon Icon--lrg Icon--solidTick Icon--green' : ($scope.diagnosis.isInScopeFalse() ? 'Icon Icon--lrg Icon--solidCross Icon--red' : '');
          };
          
          $scope.delete = function() {
            $scope.diagnosis.$delete({'case_reference': $scope.case.reference}, function() {
              $scope.case.diagnosis = null;

              $scope.logManager.refresh();  // refreshing the logs
            });
          }; 

          // if choices.length === 1 => check it by default
          $scope.$watch('diagnosis.choices', function(newVal) {
            if (newVal && newVal.length === 1) {
              $scope.diagnosis.current_node_id = newVal[0].id;
            }
          });
        }
      ]
    );
})();
