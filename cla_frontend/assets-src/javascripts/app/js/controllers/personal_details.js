(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', '_', 'personal_details', 'adaptation_details', 'thirdparty_details', 'form_utils', 'ADAPTATION_LANGUAGES', 'THIRDPARTY_REASON', 'THIRDPARTY_RELATIONSHIP', 'EXEMPT_USER_REASON', 'adaptations_metadata', 'mediacodes', '$q',
        function($scope, _, personal_details, adaptation_details, thirdparty_details, form_utils, ADAPTATION_LANGUAGES, THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP, EXEMPT_USER_REASON, adaptations_metadata, mediacodes, $q){
          $scope.personal_details = personal_details;
          $scope.adaptations = adaptation_details;
          $scope.third_party = thirdparty_details;
          $scope.language_options = ADAPTATION_LANGUAGES;
          $scope.reasons = THIRDPARTY_REASON;
          $scope.relationships = THIRDPARTY_RELATIONSHIP;
          $scope.exempt_user_reason_choices = EXEMPT_USER_REASON;

          $scope.language = {};
          if ($scope.adaptations.language === 'WELSH') {
            $scope.language.welsh_override = true;
            $scope.language.disable = true;
          }

          $scope.address = {
            postcode: $scope.personal_details.postcode,
            street: $scope.personal_details.street
          };

          $scope.$watchCollection('address', function(){
            $scope.personal_details.postcode = $scope.address.postcode;
            $scope.personal_details.street = $scope.address.street;
          });

          $scope.selected_adaptations = [];
          $scope.adaptation_flags = {};
          angular.forEach(adaptations_metadata.actions.POST, function (item, i) {
            // add available flags to array
            if (item.type === 'boolean') {
              $scope.adaptation_flags[i] = item.label;
            }
            // add server data to local array
            if ($scope.adaptations[i] === true) {
              $scope.selected_adaptations.push(i);
            }
          });

          $scope.getAdaptationLabel = function (code) {
            return $scope.adaptation_flags[code];
          };

          $scope.getExemptReasonByCode = function (code) {
            var matches = $scope.exempt_user_reason_choices.filter(function (lookup) {
              return lookup.value === code;
            });
            if (matches.length) {
              return matches[0];
            }
          };

          var media_codes = mediacodes.map(function (mc) {
            var opt = {};

            opt.code = mc.code;
            opt.label = mc.name;
            opt.group = mc.group;

            return opt;
          });
          $scope.media_codes = _.sortBy(media_codes, 'group');

          if ($scope.case.media_code) {
            $scope.media_code = $scope.case.media_code;
          }

          $scope.mediaCode = function (code) {
            var matches = media_codes.filter(function (mediacode) {
              return mediacode.code === code;
            });
            if (matches.length) {
              return matches[0];
            }
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
            $scope.is_legal_advisor = value === 'LEGAL_ADVISOR';
          };
          // trigger on first load
          $scope.relationshipChange($scope.third_party.personal_relationship);

          $scope.toggleWelsh = function (value) {
            $scope.language.disable = value ? false : true;
          };

          $scope.cancelPersonalDetails = function (form) {
            form.$cancel();
            $scope.language.disable = $scope.adaptations.language === 'WELSH';
          };

          $scope.savePersonalDetails = function(form) {
            var pdPromise = $q.defer(),
                adaptationsPromise = $q.defer(),
                mcPromise = $q.defer(),
                selected_adaptation = this.selected_adaptations;

            //console.log($scope.address);

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

            // set adaptations
            angular.forEach($scope.adaptation_flags, function (label, key) {
              $scope.adaptations[key] = selected_adaptation.indexOf(key) !== -1;
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

            // save media code & exempt_user
            $scope.case.media_code = this.media_code;

            $scope.case.$patch().then(function () {
              $scope.media_code = $scope.case.media_code !== null ? $scope.case.media_code : undefined;
              mcPromise.resolve();
            }, function(err){
              form_utils.ctrlFormErrorCallback($scope, err, form);
              mcPromise.reject(err);
            });


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
