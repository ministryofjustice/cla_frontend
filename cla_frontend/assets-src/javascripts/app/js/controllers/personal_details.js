(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', 'personal_details', 'adaptation_details', 'thirdparty_details', 'History', 'form_utils', 'case_states',
        function($scope, personal_details, adaptation_details, thirdparty_details, History, form_utils, case_states){
          console.log(case_states);
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.personal_details = personal_details;
          $scope.adaptations = adaptation_details;
          $scope.third_party = thirdparty_details;

          $scope.toggle_adaptations = $scope.case.adaptation_details ? true : false;

          $scope.language_options = [
            {value: 'WELSH', text: 'Language line'},
            {value: 'OTHER', text: 'Some other line'},
            {value: 'NONE', text: 'none'}
          ];
          $scope.adaptation_options = [
            {value: 'CALLBACK_PHONE', text: 'callback requested by phone'},
            {value: 'CALLBACK_TEXT', text: 'callback requested by text'},
            {value: 'CALLBACK_WEBSITE', text: 'callback requested through website'},
            {value: 'NONE', text: 'none'}
          ];
          $scope.reasons = [
            {value: 'CHILD_PATIENT', text: 'is a child or patient'},
            {value: 'POWER_ATTORNEY', text: 'they are subject to a power of attorney'},
            {value: 'NO_TELEPHONE_DISABILITY', text: 'they cannot communicate via the telephone, due to a disability'},
            {value: 'NO_TELEPHONE_LANGUAGE', text: 'they cannot communicate via the telephone, due to a language requirement'},
            {value: 'OTHER', text: 'other'}
          ];
          $scope.relationships = [
            {'PARENT_GUARDIAN': 'Parent or guardian'},
            {'FAMILY_FRIEND': 'Family friend'},
            {'PROFESSIONAL': 'Professional'},
            {'LEGAL_ADVISOR': 'Legal advisor'},
            {'OTHER': 'Other'}
          ];

          $scope.validate = function (isValid) {
            if (isValid) {
              return true;
            } else {
              return 'false';
            }
          };

          $scope.validateRadio = function (value) {
            if (value !== undefined) {
              return true;
            } else {
              return 'This field is required';
            }
          };

          $scope.savePersonalDetails = function(form) {
            // save personal details
            $scope.personal_details.$update(function (data) {
              if (!$scope.case.personal_details) {
                $scope.case.$associate_personal_details(data.reference, function () {
                  $scope.case.personal_details = data.reference;
                });
              }
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.personal_details = personal_details;
            });
            // save adaptations
            $scope.adaptations.$update(function (data) {
              if (!$scope.case.adaptations) {
                $scope.case.$associate_adaptation_details(data.reference, function () {
                  $scope.case.adaptation_details = data.reference;
                });
              }
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.adaptations = adaptation_details;
            });
            return true;
          };

          $scope.saveThirdParty = function(form) {
            $scope.third_party.$update(function (data) {
              if (!$scope.case.thirdparty_details) {
                $scope.case.$associate_thirdparty_details(data.reference, function () {
                  $scope.case.thirdparty_details = data.reference;
                });
              }
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.third_party = thirdparty_details;
            });
            return true;
          };
        }
      ]
    );
})();