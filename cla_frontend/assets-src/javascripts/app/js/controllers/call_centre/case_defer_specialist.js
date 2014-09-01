(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CaseDeferSpecialistsCtrl',
      ['$scope', '$state', 'flash',
        function($scope, $state, flash) {

          $scope.defer = function() {
            $scope.case.$defer_assignment({
              'notes': $scope.notes
            }).then(function() {
              $state.go('case_list');
              flash('success', 'Case '+$scope.case.reference+' deferred successfully');
            });
          };
        }
      ]
    );
})();
