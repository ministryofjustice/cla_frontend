(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('EligibilityCheckSummaryCtrl',
      ['$scope', '$http',
        function($scope, $http) {
          if ($scope.case.eligibility_check) {
            $http.get('/call_centre/case/'+$scope.case.reference+'/means_summary/').success(function(data) {
              $scope.means_summary = data;
            });
          }
        }
      ]
    );
})();