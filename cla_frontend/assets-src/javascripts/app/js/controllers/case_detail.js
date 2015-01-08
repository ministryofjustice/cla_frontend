(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'diagnosis', 'personal_details', '$modal', 'MatterType', 'History', 'log_set', 'hotkeys', '$state', 'AppSettings', 'ClaPostalService',
        function($rootScope, $scope, $case, $eligibility_check, $diagnosis, $personal_details, $modal, MatterType, History, log_set, hotkeys, $state, AppSettings, ClaPostalService){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.case = $case;
          $scope.log_set = log_set;
          $scope.eligibility_check = $eligibility_check;
          $scope.diagnosis = $diagnosis;
          $scope.personal_details = $personal_details;
          $scope.appName = AppSettings.appName;

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });

          hotkeys
            .bindTo($scope)
            .add({
              combo: 'g d',
              description: 'Scope diagnosis',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.edit.diagnosis');
              }
            })
            .add({
              combo: 'g f',
              description: 'Financial assessment',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.edit.eligibility');
              }
            })
            .add({
              combo: 'g a',
              description: 'Assign provider',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.assign');
              }
            })
            .add({
              combo: 'g h',
              description: 'Alternative help',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.alternative_help');
              }
            })
            .add({
              combo: 'g s',
              description: 'Suspend a case',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
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
