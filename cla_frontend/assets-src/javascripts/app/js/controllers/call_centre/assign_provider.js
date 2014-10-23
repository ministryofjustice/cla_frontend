(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('AssignProviderCtrl', ['$scope', '_', '$state', 'form_utils', '$stateParams', 'flash', 'matter_types',
      function($scope, _, $state, form_utils, $stateParams, flash, matter_types) {
        $scope.is_manual = false;
        $scope.is_spor = false;
        $scope.suggested_providers = [];
        $scope.matter1_types = _.where(matter_types, {level: 1});
        $scope.matter2_types = _.where(matter_types, {level: 2});

        var as_of = $stateParams.as_of;

        $scope.case.get_suggested_providers(as_of).success(function(data) {
          $scope.suggested_providers = data.suggested_provider === null ? data.suitable_providers : _.reject(data.suitable_providers, {
            id: data.suggested_provider.id
          });
          $scope.suggested_provider = data.suggested_provider;
          $scope.selected_provider = data.suggested_provider;

          $scope.is_manual = data.suggested_provider === null;

          // if provider has already been assigned
          if ($scope.case.provider) {
            $scope.selected_provider = _.findWhere(data.suitable_providers, {id: $scope.case.provider});
          }
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
          if($scope.suggested_providers.length < 1) {
            return false;
          }
          if(!$scope.suggested_provider) {
            return false;
          }
          if($scope.case.provider !== null) {
            return false;
          }



          return true;
          // return ($scope.suggested_providers.length > 0 || $scope.suggested_provider) && ($scope.case.diagnosis_state === 'INSCOPE' && $scope.case.eligibility_state === 'yes');
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

          $scope.case.$set_matter_types().then(
            function () {
              $scope.case.$assign(data).then(
                function(response) {
                  $state.go('case_list');
                  flash('success', 'Case ' + $scope.case.reference + ' assigned to ' + response.data.name);
                },
                function(data) {
                  form_utils.ctrlFormErrorCallback($scope, data, form);
                }
              );
            },
            function (data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            }
          );
        };
      }
    ]);
})();
