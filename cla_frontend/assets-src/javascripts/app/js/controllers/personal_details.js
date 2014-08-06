(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', 'personal_details', 'adaptation_details', 'thirdparty_details', 'form_utils', 'ADAPTATION_LANGUAGES', 'THIRDPARTY_REASON', 'THIRDPARTY_RELATIONSHIP', 'adaptations_metadata', 'mediacodes', '$q',
        function($scope, personal_details, adaptation_details, thirdparty_details, form_utils, ADAPTATION_LANGUAGES, THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP, adaptations_metadata, mediacodes, $q){
          $scope.personal_details = personal_details;
          $scope.adaptations = adaptation_details;
          $scope.third_party = thirdparty_details;

          $scope.toggle_adaptations = $scope.case.adaptation_details ? true : false;
          $scope.language = {};
          if ($scope.adaptations.language === 'WELSH') {
            $scope.language.welsh_override = true;
            $scope.language.disable = true;
          }

          $scope.language_options = ADAPTATION_LANGUAGES;
          $scope.reasons = THIRDPARTY_REASON;
          $scope.relationships = THIRDPARTY_RELATIONSHIP;

          $scope.selected_adaptations = [];
          $scope.adaptation_flags = {};
          angular.forEach(adaptations_metadata.actions.POST, function (item, i) {
            if (item.type === 'boolean') {
              $scope.adaptation_flags[i] = item;
            }
          });

          $scope.setAdaptations = function () {
            $scope.selected_adaptations = [];
            angular.forEach($scope.adaptation_flags, function (item, i) {
              if ($scope.adaptations[i] === true) {
                $scope.selected_adaptations.push(item.label);
              }
            });
          };
          $scope.setAdaptations();

          $scope.media_codes = mediacodes.map(function (mc) {
            return mc.code;
          });
          $scope.media_code = {};
          if ($scope.case.media_code) {
            $scope.media_code.selected = $scope.case.media_code;
          }
          $scope.$watch('media_code', function () {
            if ($scope.case.media_code !== $scope.media_code.selected) {
              $scope.case.media_code = $scope.media_code.selected;
            }
          });

          // adaptations -- TEST
          $scope.adaptation_opts = [
            {id: 1, title: 'Opt 1', ticked: false},
            {id: 2, title: 'Opt 2', ticked: false},
            {id: 3, title: 'Opt 3', ticked: false}
          ];

          $scope.mediaCode = function (code) {
            var matches = mediacodes.filter(function (mediacode) {
              return mediacode.code === code;
            });
            if (matches.length) {
              return matches[0];
            }
          };

          $scope.filterMediaCodes = function (actual, expected) {
            var r = new RegExp(expected, 'i');
            var mc = $scope.mediaCode(actual);
            return r.test(mc.code) || r.test(mc.name);
          };

          $scope.mediaCodeGroup = function (code) {
            return $scope.mediaCode(code).group;
          };

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

          $scope.relationshipChange = function (value) {
            console.log(value);
          };

          $scope.toggleWelsh = function (value) {
            $scope.language.disable = value ? false : true;
          };

          $scope.cancelPersonalDetails = function (form) {
            form.$cancel();
            $scope.language.disable = $scope.adaptations.language === 'WELSH' ? true : false;
          };

          $scope.savePersonalDetails = function(form) {
            var pdPromise = $q.defer(),
                adaptationsPromise = $q.defer(),
                mcPromise = $q.defer();

            $scope.setAdaptations();

            if ($scope.language.welsh_override) {
              $scope.adaptations.language = 'WELSH';
            }

            // save personal details
            $scope.personal_details.$update($scope.case.reference, function (data) {
              if (!$scope.case.personal_details) {
                $scope.case.personal_details = data.reference;
              }
              pdPromise.resolve();
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.personal_details = personal_details;
              pdPromise.reject('fail');
            });
            // save adaptations
            $scope.adaptations.$update($scope.case.reference, function (data) {
              if (!$scope.case.adaptation_details) {
                $scope.case.adaptation_details = data.reference;
              }
              adaptationsPromise.resolve();
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.adaptations = adaptation_details;
              adaptationsPromise.reject();
            });
            // save media code
            if ($scope.case.media_code !== undefined) {
              $scope.case.$set_media_code().then(function () {
                $scope.media_code.selected = $scope.case.media_code !== null ? $scope.case.media_code : undefined;

                mcPromise.resolve();
              });
            } else {
              mcPromise.resolve();
            }
            return $q.all([pdPromise.promise, adaptationsPromise.promise, mcPromise.promise]);
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
