(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CaseDetailValidateAltHelpCtrl',
      ['$scope', '$modal', '$state',
        function($scope, $modal, $state){
          $scope.validateAltHelp = function() {

            if (!$scope.diagnosis || !$scope.diagnosis.category) {
              $modal.open({
                templateUrl: 'case_detail.alt_help_modal.html',
                controller: 'InvalidCtrl'
              });
            } else {
              $state.go('case_detail.alternative_help');
            }
          };
        }
      ]
    );
})();
