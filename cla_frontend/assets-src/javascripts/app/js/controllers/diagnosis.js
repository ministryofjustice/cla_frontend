(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('DiagnosisCtrl', 
      ['$scope', 'Diagnosis',
        function($scope, Diagnosis) {
          $scope.diagnosis = new Diagnosis({
            'case_reference': $scope.case.reference
          });

          if (!$scope.case.diagnosis) {
            $scope.diagnosis.$save();
          } else {
            $scope.diagnosis.$get();
          }
          
          $scope.save = function() {
            $scope.diagnosis.$patch({
              'case_reference': $scope.case.reference
            });
          }
        }

      ]
    );
})();