(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDeclineSpecialistsCtrl',
      ['$scope', '$state',
        function($scope, $state) {
          $scope.decline = function() {
            $scope.case.$decline_specialists({
              'notes': $scope.notes
            }, function() {
              $state.go('case_list');
            });
          };
        }
      ]
    );
})();
