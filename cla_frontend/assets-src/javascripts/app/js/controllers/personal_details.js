(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', 'personal_details', 'ThirdParty', 'History', 'form_utils',
        function($scope, personal_details, ThirdParty, History, form_utils){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.personal_details = personal_details;
          $scope.third_party = $scope.case.thirdparty_details ? ThirdParty.get({ref: $scope.case.thirdparty_details}) : new ThirdParty();

          $scope.reasons = [
            {value: 'CHILD_PATIENT', text: 'is a child or patient'},
            {value: 'POWER_ATTORNEY', text: 'they are subject to a power of attorney'},
            {value: 'NO_TELEPHONE_DISABILITY', text: 'they cannot communicate via the telephone, due to a disability'},
            {value: 'NO_TELEPHONE_LANGUAGE', text: 'they cannot communicate via the telephone, due to a language requirement'},
            {value: 'OTHER', text: 'other'}
          ];
          $scope.relationships = [
            {value: 'PARENT_GUARDIAN', text: 'Parent or guardian'},
            {value: 'FAMILY_FRIEND', text: 'Family friend'},
            {value: 'PROFESSIONAL', text: 'Professional'},
            {value: 'LEGAL_ADVISOR', text: 'Legal advisor'},
            {value: 'OTHER', text: 'Other'}
          ];

          $scope.getRelationshipDisplay = function(value) {
            var v = _.find($scope.relationships, function(r) { return r.value === value;});
            if (v !== undefined) {
              v = v.text;
            }
            return v;
          };

          $scope.getReasonDisplay = function(value) {
            var v = _.find($scope.reasons, function(r) { return r.value === value;});
            if (v !== undefined) {
              v = v.text;
            }
            return v;
          };

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
              $scope.third_party = $scope.case.thirdparty_details ? ThirdParty.get({ref: $scope.case.thirdparty_details}) : new ThirdParty();
            });
            return true;
          };
        }
      ]
    );
})();
