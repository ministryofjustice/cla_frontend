(function(){
  'use strict';
  
  angular.module('cla.controllers')
    .controller('DiagnosisSummaryCtrl',
      ['$scope',
        function($scope) {
          $scope.diagnosisTitle = function () {
            return $scope.diagnosis.isInScopeTrue() ? 'In scope' : ($scope.diagnosis.isInScopeFalse() ? 'Not in scope' : 'Scope diagnosis');
          };
          $scope.diagnosisTitleClass = function () {
            return $scope.diagnosis.isInScopeTrue() ? 'Icon Icon--lrg Icon--solidTick Icon--green' : ($scope.diagnosis.isInScopeFalse() ? 'Icon Icon--lrg Icon--solidCross Icon--red' : '');
          };    
        }
      ]
    );
})();