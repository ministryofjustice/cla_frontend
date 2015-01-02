(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailEditCtrl',
      ['$scope', 'AlternativeHelpService', 'AppSettings',
        function($scope, AlternativeHelpService, AppSettings){
          // when viewing coming back to the details view
          // clear out the Alternative Help selections.
          AlternativeHelpService.clear();

          $scope.diagnosisIcon = function () {
            return $scope.diagnosis.isInScopeTrue() ? 'Icon Icon--right Icon--solidTick Icon--green' : ($scope.diagnosis.isInScopeFalse() ? 'Icon Icon--right Icon--solidCross Icon--red' : '');
          };
          $scope.eligibilityIcon = function () {
            return $scope.eligibility_check.isEligibilityTrue() ? 'Icon Icon--right Icon--solidTick Icon--green' : ($scope.eligibility_check.isEligibilityFalse() ? 'Icon Icon--right Icon--solidCross Icon--red' : '');
          };

          $scope.includePath = AppSettings.BASE_URL.substring(1);
        }
      ]
    );
})();
