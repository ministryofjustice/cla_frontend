(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl',
      ['$scope', 'AlternativeHelpService',
        function($scope, AlternativeHelpService){
          // when viewing coming back to the details view
          // clear out the Alternative Help selections.
          AlternativeHelpService.clear();

          $scope.diagnosisIcon = function () {
            return $scope.diagnosis.isInScopeTrue() ? 'Icon Icon--right Icon--solidTick Icon--green' : ($scope.diagnosis.isInScopeFalse() ? 'Icon Icon--right Icon--solidCross Icon--red' : '');
          };
          $scope.eligibilityIcon = function () {
            return $scope.eligibility_check.isEligibilityTrue() ? 'Icon Icon--right Icon--solidTick Icon--green' : ($scope.eligibility_check.isEligibilityFalse() ? 'Icon Icon--right Icon--solidCross Icon--red' : '');
          };
        }
      ]
    );
})();
