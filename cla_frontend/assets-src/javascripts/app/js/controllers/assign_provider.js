(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('AssignProviderCtrl',
      ['$scope', '_', '$state',
        function($scope, _, $state){
          $scope.is_manual = false;

          $scope.case.get_suggested_providers().success(function(data){
            $scope.suggested_providers = data.suggested_provider === null ? data.suitable_providers : _.reject(data.suitable_providers, {id: data.suggested_provider.id});
            $scope.suggested_provider = data.suggested_provider;
            $scope.selected_provider = data.suggested_provider;

            $scope.is_manual = data.suggested_provider === null;
          });

          $scope.assignManually = function(choice) {
            $scope.is_manual = choice;

            // reset selected to suggested provider
            if (!choice) {
              $scope.selected_provider = $scope.suggested_provider;
              $scope.provider_search = '';
            }
          };

          $scope.assign = function() {
            $scope.case.$assign({
              provider_id: $scope.selected_provider.id,
              is_manual: $scope.is_manual,
              assign_notes: $scope.assign_notes
            }).success(function(){
              $state.go('case_detail.assign.complete', {}, {'reload': true});
            });
          };
        }
      ]
    );
})();