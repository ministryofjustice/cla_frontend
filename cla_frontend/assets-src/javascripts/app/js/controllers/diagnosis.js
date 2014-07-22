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

          $scope.save = function() {
            $scope.diagnosis.$patch({
              'case_reference': $scope.case.reference
            });
          };
          
        }

      ]
    );
})();