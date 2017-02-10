(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisCtrl',
      ['$scope', 'Category', 'postal',
        function($scope, Category, postal) {
          // used to track the state of the diagnosis during the first load
          // so that we can show the back button at completion only the
          // first time
          $scope.is_ongoing = $scope.diagnosis.isInScopeUnknown();

          // updates the state of case.diagnosis_state after each save
          function saveCallback(data, forceLogRefresh) {
            $scope.case.diagnosis_state = data.state;

            if (!$scope.diagnosis.isInScopeUnknown() || forceLogRefresh) {
              // refreshing the logs
              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
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
            var wasComplete = !$scope.diagnosis.isInScopeUnknown();

            $scope.diagnosis.$move_up({
              'case_reference': $scope.case.reference
            }, function(data) {
              saveCallback(data, wasComplete);
            });
          };
          
          $scope.delete = function() {
            $scope.diagnosis.$delete({'case_reference': $scope.case.reference}, function() {
              $scope.case.diagnosis = null;
              $scope.is_ongoing = true;

              // refreshing the logs
              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
            });
          }; 

          // if choices.length === 1 => check it by default
          $scope.$watch('diagnosis.choices', function(newVal) {
            if (newVal && newVal.length === 1) {
              $scope.diagnosis.current_node_id = newVal[0].id;
            }
          });

          $scope.$watch('diagnosis.category', function(newVal) {
            if (!newVal) {
              $scope.category = null;
            } else {
              Category.get({code: $scope.diagnosis.category}).$promise.then(function(data) {
                $scope.category = data;
              });
            }
          });
        }
      ]
    );
})();
