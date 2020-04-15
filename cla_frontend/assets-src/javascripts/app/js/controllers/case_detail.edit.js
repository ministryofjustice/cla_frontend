(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailEditCtrl',
      ['$scope', 'eligibility_check', 'AlternativeHelpService', 'AppSettings',
        function($scope, eligibility_check, AlternativeHelpService, AppSettings){
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
          $scope.skipFinancialChecks = function() {
            eligibility_check.has_passported_proceedings_letter = true;
            eligibility_check.$update($scope.case.reference, function(data) {
              $scope.case.eligibility_check = eligibility_check.reference;
              $scope.case.$get();
            });
          }

        }
      ]
    );
})();
