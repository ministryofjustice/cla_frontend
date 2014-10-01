(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'diagnosis', 'personal_details', '$modal', 'MatterType', 'History', 'log_set', 'hotkeys', '$state',
        function($rootScope, $scope, $case, $eligibility_check, $diagnosis, $personal_details, $modal, MatterType, History, log_set, hotkeys, $state){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.case = $case;
          $scope.log_set = log_set;
          $scope.eligibility_check = $eligibility_check;
          $scope.diagnosis = $diagnosis;
          $scope.personal_details = $personal_details;

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });

          $scope.edit_matter_types = function (next) {
            var child_scope = $scope.$new();
            child_scope.next = next;
            $modal.open({
              templateUrl: 'case_detail.matter_type.html',
              controller: 'SetMatterTypeCtrl',
              scope: child_scope,
              resolve: {
                'matter_types': function () {
                  return MatterType.get({
                    category__code: $scope.diagnosis.category
                  }).$promise;
                }
              }
            });
          };

          hotkeys
            .bindTo($scope)
            .add({
              combo: 'g c',
              description: 'Case home',
              callback: function() {
                $state.go('case_detail.edit');
              }
            })
            .add({
              combo: 'g d',
              description: 'Scope diagnosis',
              callback: function() {
                $state.go('case_detail.edit.diagnosis');
              }
            })
            .add({
              combo: 'g f',
              description: 'Financial assessment',
              callback: function() {
                $state.go('case_detail.edit.eligibility');
              }
            })
            .add({
              combo: 'g a',
              description: 'Assign provider',
              callback: function() {
                $state.go('case_detail.assign');
              }
            })
            .add({
              combo: 'g h',
              description: 'Alternative help',
              callback: function() {
                $state.go('case_detail.alternative_help');
              }
            })
            .add({
              combo: 'g s',
              description: 'Alternative help',
              callback: function() {
                $state.go('case_detail.suspend');
              }
            });

          // modelsEventManager.onEnter();
          // $scope.$on('$destroy', function () {
          //   modelsEventManager.onExit();
          // });
        }
      ]
    );
})();
