(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'diagnosis', 'personal_details', 'eod_details', '$uibModal', 'MatterType', 'History', 'log_set', 'hotkeys', '$state', 'AppSettings', 'ClaPostalService', '$window',
        function($rootScope, $scope, $case, $eligibility_check, $diagnosis, $personal_details, eod_details, $uibModal, MatterType, History, log_set, hotkeys, $state, AppSettings, ClaPostalService, $window){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.case = $case;
          $scope.eod_details = eod_details;
          $scope.log_set = log_set;
          $scope.eligibility_check = $eligibility_check;
          $scope.diagnosis = $diagnosis;
          $scope.personal_details = $personal_details;
          $scope.appName = AppSettings.appName;
          $scope.GTMClientUpdated = false;

          $scope.sendGAUserAndCasePageEvent = function() {
            if($scope.GMTClientUpdated)return;
            var gtm_anon_id = $scope.case ? $scope.case.gtm_anon_id : null;
            $window.dataLayer.push({ 'user_id': gtm_anon_id || null });
            $window.dataLayer.push({ 'event': 'CasePageOpened', 'Interface': $scope.appName, 'CaseReference': $scope.case ? $scope.case.reference : null, 'LawCategoryAfterOpDiagnosed': $scope.case ? $scope.case.category : null, 'MeansEligibilityResult': $scope.case ? $scope.case.eligibility_state : null });
            $scope.GTMClientUpdated = true;
          }

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
            $scope.sendGAUserAndCasePageEvent();
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
            })
            .add({
              combo: 'g e',
              description: 'Add expressions of dissatisfaction',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.eod_details');
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
