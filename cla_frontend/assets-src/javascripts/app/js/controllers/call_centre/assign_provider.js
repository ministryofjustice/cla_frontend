(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('AssignProviderCtrl', ['$scope', '_', '$state', 'form_utils', 'flash', 'MatterTypes', 'Suggestions', 'postal', 'diagnosis', '$uibModal', '$q',
      function($scope, _, $state, form_utils, flash, MatterTypes, Suggestions, postal, diagnosis, $uibModal, $q) {
        $scope.category = diagnosis.category;
        $scope.is_manual = false;
        $scope.is_manual_ref = false;
        $scope.is_spor = false;
        $scope.is_urgent = false;
        $scope.suggested_providers = [];
        $scope.matter1_types = _.where(MatterTypes, {level: 1});
        $scope.matter2_types = _.where(MatterTypes, {level: 2});
        $scope.assigning_provider_in_progress = false;

        // if provider has already been assigned
        if ($scope.case.provider) {
          $scope.selected_provider = _.findWhere(Suggestions.suitable_providers, {id: $scope.case.provider});
        } else {
          $scope.suggested_providers = Suggestions.suggested_provider === null ? Suggestions.suitable_providers : _.reject(Suggestions.suitable_providers, {
            id: Suggestions.suggested_provider.id
          });
          $scope.suggested_provider = $scope.selected_provider = Suggestions.suggested_provider;
          $scope.is_manual = Suggestions.suggested_provider === null;
        }

        $scope.assignManually = function(choice) {
          $scope.is_manual = choice;

          postal.publish({channel: 'AssignProvider', topic: 'manual', data: {label: choice}});

          // reset selected to suggested provider
          if (!choice) {
            $scope.is_manual_ref = false;
            $scope.selected_provider = $scope.suggested_provider;
            $scope.provider_search = '';
          }
        };

        $scope.getMTDescription = function (code) {
          var type = _.findWhere(MatterTypes, {code: code});
          return type ? type.description : '';
        };

        $scope.canAssign = function () {
          if($scope.suggested_providers.length > 0 || $scope.suggested_provider || !$scope.case.provider) {
            return true;
          }
          return false;
        };

        $scope.isEducationF2F = function () {
          return $scope.suggested_providers.length < 1 && !$scope.suggested_provider && !$scope.case.provider && $scope.case.category == 'Education';
        }

        $scope.getF2fDeepLink = function () {
          if ($scope.personal_details && $scope.personal_details.postcode) {
            return 'https://find-legal-advice.justice.gov.uk/?postcode=' + encodeURI($scope.personal_details.postcode);
          }
          return 'https://find-legal-advice.justice.gov.uk/';
        };

        $scope.assign = function(form) {
          var data = {
            provider_id: $scope.selected_provider.id,
            is_manual_ref: $scope.is_manual_ref,
            is_manual: $scope.is_manual,
            is_spor: $scope.is_spor,
            is_urgent: $scope.is_urgent
          };

          if ($scope.is_manual) {
            data.notes = $scope.notes;
          }

          $scope.case.$set_matter_types().then(
            function () {
              $scope.assigning_provider_in_progress = true;
              $scope.case.$assign(data).then(
                function(response) {
                  $state.go('case_list');
                  flash('success', 'Case ' + $scope.case.reference + ' assigned to ' + response.data.name);
                },
                function(data) {
                  $scope.assigning_provider_in_progress = false
                  form_utils.ctrlFormErrorCallback($scope, data, form);
                }
              );
            },
            function (data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            }
          );
        };

        function saveAlternativeHelp(code, notes) {
          return $scope.case.$assign_alternative_help({
            selected_providers: null,
            notes: notes,
            event_code: code
          });
        };

        function isECFRequired() {
          var isOutOfScope = $scope.diagnosis && !$scope.diagnosis.isInScopeTrue(),
            category = $scope.diagnosis.category;
          if (isOutOfScope && category) {
            return _.some($scope.law_categories, {ecf_available: true, code: category});
          }
          return false;
        }

        function showECFModal() {
          return $uibModal.open({
            templateUrl: 'case_detail.alternative_help.ecf.html',
            controller: 'SetECFundCtrl',
            scope: $scope
          }).result;
        }

        $scope.submit = function (code, notes) {
          code = code || this.code;
          showModal().then(function () {
            saveAlternativeHelp(code, notes)
              .then(function () {
                $state.go('case_list');
              }, function(response){
                console.log('something went wrong', response);
              });
          });
        };

        function showModal() {
          if(isECFRequired()) {
            return showECFModal();
          }
          if($scope.$root.showCallScript) {
            return showSurveyModal();
          }
          return $q.when(true);
        }

        function showSurveyModal() {
          return $uibModal.open({
            templateUrl: 'alternative_help_survey.modal.html',
            controller: function ($scope, $uibModalInstance) {
              $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };
              $scope.continue = function() {
                $uibModalInstance.close();
              };
            }
          }).result;
        };

        $scope.decline_help = function() {
          return showModal();
        };
      }
    ]);
})();
