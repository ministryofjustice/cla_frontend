(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseCtrl',
      ['$scope', '$state', 'Case',
        function($scope, $state, Case) {
          $scope.addCase = function() {
            new Case().$save(function(data) {
              $state.go('case_detail.edit', {caseref:data.reference});
            });
          };
        }
      ]
    );
})();