/*jshint maxstatements:20 */

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', 'personal_details', 'adaptation_details', 'thirdparty_details', 'History', 'form_utils', 'ADAPTATION_LANGUAGES', 'THIRDPARTY_REASON', 'THIRDPARTY_RELATIONSHIP',
        function($scope, personal_details, adaptation_details, thirdparty_details, History, form_utils, ADAPTATION_LANGUAGES, THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.personal_details = personal_details;
          $scope.adaptations = adaptation_details;
          $scope.third_party = thirdparty_details;

          $scope.toggle_adaptations = $scope.case.adaptation_details ? true : false;
          if ($scope.adaptations.language === 'WELSH') {
            $scope.welsh_override = true;
            $scope.disable_lang = true;
          }
          
          $scope.language_options = ADAPTATION_LANGUAGES;
          $scope.reasons = THIRDPARTY_REASON;
          $scope.relationships = THIRDPARTY_RELATIONSHIP;

          $scope.setAdaptations = function () {
            $scope.selected_adaptations = [];
            for (var k in $scope.adaptations ) {
              if ($scope.adaptations[k] === true && k.indexOf('$') === -1) {
                $scope.selected_adaptations.push(k);
              }
            }
          };
          $scope.setAdaptations();

          $scope.getDisplayLabel = function(value, list) {
            var v = _.find(list, function(r) { return r.value === value;});
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

          $scope.toggleWelsh = function (value) {
            if (value) {
              $scope.disable_lang = false;
            } else {
              $scope.disable_lang = true;
            }
          };

          $scope.cancelPersonalDetails = function () {
            $scope.personaldetails_frm.$cancel();
            $scope.disable_lang = $scope.adaptations.language === 'WELSH' ? true : false;
          };

          $scope.savePersonalDetails = function(form) {
            $scope.setAdaptations();

            if ($scope.welsh_override) {
              $scope.adaptations.language = 'WELSH';
            }
            // save personal details
            $scope.personal_details.$update($scope.case.reference, function (data) {
              if (!$scope.case.personal_details) {
                $scope.case.personal_details = data.reference;
              }
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.personal_details = personal_details;
            });
            // save adaptations
            $scope.adaptations.$update($scope.case.reference, function (data) {
              if (!$scope.case.adaptation_details) {
                $scope.case.adaptation_details = data.reference;
              }
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.adaptations = adaptation_details;
            });
            return true;
          };

          $scope.saveThirdParty = function(form) {
            $scope.third_party.$update($scope.case.reference, function (data) {
              if (!$scope.case.thirdparty_details) {
                $scope.case.thirdparty_details = data.reference;
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
