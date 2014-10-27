(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('CaseDetailCloseCtrl',
      ['$scope', '$state', 'flash', '$modal',
        function($scope, $state, flash){
          var case_ref = $scope.case.reference;

          $scope.close = function() {
            this.case.$close_case().then(function() {
              $state.go('case_list');
              flash('success', 'Case '+case_ref+' closed successfully.');
            });
          };
        }
      ]
    );
})();
