(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('AssignProviderCtrl', ['$scope', '_', '$state', 'form_utils', '$stateParams',
      function($scope, _, $state, form_utils, $stateParams) {
        $scope.is_manual = false;
        $scope.is_spor = false;
        $scope.suggested_providers = [];


        var as_of = $stateParams.as_of;

        $scope.case.get_suggested_providers(as_of).success(function(data) {
          $scope.suggested_providers = data.suggested_provider === null ? data.suitable_providers : _.reject(data.suitable_providers, {
            id: data.suggested_provider.id
          });
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

        $scope.assignSPOR = function () {
          $scope.is_spor = true;
        };

        $scope.canAssign = function () {
          return ($scope.suggested_providers.length > 0 || $scope.suggested_provider) && ($scope.case.diagnosis_state === 'INSCOPE' && $scope.case.eligibility_state === 'yes');
        };

        $scope.assign = function(form) {
          var data = {
            provider_id: $scope.selected_provider.id,
            is_manual: $scope.is_manual,
            is_spor: $scope.is_spor
          };
          if ($scope.is_manual) {
            data.notes = $scope.notes;
          }
          $scope.case.$assign(data).then(
            function() {
              $state.go('case_detail.assign.complete', {}, {
                'reload': true
              });
            },
            function(data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            }
          );
        };
      }
    ]);
})();
