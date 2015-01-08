(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', '_', 'personal_details', 'adaptation_details', 'thirdparty_details', 'form_utils', 'ADAPTATION_LANGUAGES', 'THIRDPARTY_REASON', 'THIRDPARTY_RELATIONSHIP', 'EXEMPT_USER_REASON', 'CASE_SOURCE', 'adaptations_metadata', 'mediacodes', '$q', 'flash', 'postal',
        function($scope, _, personal_details, adaptation_details, thirdparty_details, form_utils, ADAPTATION_LANGUAGES, THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP, EXEMPT_USER_REASON, CASE_SOURCE, adaptations_metadata, mediacodes, $q, flash, postal){
          $scope.personal_details = personal_details;
          $scope.adaptations = adaptation_details;
          $scope.third_party = thirdparty_details;
          $scope.language_options = ADAPTATION_LANGUAGES;
          $scope.reasons = THIRDPARTY_REASON;
          $scope.relationships = THIRDPARTY_RELATIONSHIP;
          $scope.sources = CASE_SOURCE;
          $scope.exempt_user_reason_choices = EXEMPT_USER_REASON;

          $scope.language = {};
          if ($scope.adaptations.language === 'WELSH') {
            $scope.language.welsh_override = true;
            $scope.language.disable = true;
          }

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

          $scope.getLanguageLabel = function (code) {
            var obj = _.findWhere($scope.language_options, {value: code});
            return obj ? obj.text : null;
          };

          $scope.getExemptReasonByCode = function (code) {
            var matches = $scope.exempt_user_reason_choices.filter(function (lookup) {
              return lookup.value === code;
            });
            if (matches.length) {
              return matches[0];
            }
          };

          $scope.exemptChange = function (value) {
            $scope.is_exempt = value;
          };
          // trigger on first load
          $scope.exemptChange($scope.case.exempt_user);

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

          if ($scope.case.source) {
            $scope.source = $scope.case.source;
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

          $scope.spokenOptions = [
            {value: true, text: 'Yes'},
            {value: false, text: 'No'}
          ];
          $scope.spokenWithToggle = function (value) {
            $scope.show_reason = value === undefined || value === null ? false : !value;
          };
          // trigger on first load
          $scope.spokenWithToggle($scope.third_party.spoke_to);

          $scope.toggleWelsh = function (value) {
            $scope.language.disable = value ? false : true;
          };

          $scope.showPersonalDetails = function(form, isNew) {
            form.$show();
            $scope.personal_details_frm_visible = true;

            var topic = isNew ? 'create' : 'edit';
            postal.publish({channel: 'Person', topic: topic});
          };

          $scope.cancelPersonalDetails = function (form) {
            form.$cancel();
            $scope.language.disable = $scope.adaptations.language === 'WELSH';
            $scope.personal_details_frm_visible = false;

            postal.publish({channel: 'Person', topic: 'cancel'});
          };

          $scope.showThirdParty = function(form, isNew) {
            form.$show();
            $scope.add_thirdparty = true;

            var topic = isNew ? 'create' : 'edit';
            postal.publish({channel: 'ThirdParty', topic: topic});
          };

          $scope.cancelThirdParty = function(form) {
            form.$cancel();
            $scope.add_thirdparty = false;
            $scope.spokenWithToggle($scope.third_party.spoke_to);

            postal.publish({channel: 'ThirdParty', topic: 'cancel'});
          };

          $scope.searchPersonOptions = {
            minimumInputLength: 3,
            ajax: {
              data: function (term) {
                return {
                  query: term
                };
              },
              quietMillis: 500,
              transport: function(queryParams) {
                return $scope.case.$search_for_personal_details(
                    queryParams.data.query
                  ).then(queryParams.success);
              },
              results: function (data) {
                var text, extra_text, results;

                results = data.data.map(function(person) {
                  text = person.full_name;
                  if (person.postcode || person.dob) {
                    extra_text = [];
                    if (person.postcode) {
                      extra_text.push(person.postcode);
                    }
                    if (person.dob) {
                      extra_text.push([person.dob.day, person.dob.month, person.dob.year].join('-'));
                    }
                    text += ' ('+extra_text.join(', ')+')';
                  }
                  return {id: person.reference, text: text};
                });
                return {results: results};
              }
            },
            initSelection: function(element, callback) {
              callback({id: element.val(), text: element.select2('data').text});
            }
          };

          $scope.$watch('person_q', function(val) {
            if (val && val.id) {
              var pd_ref = val.id,
                  pd_full_name = val.text;

              if (confirm('Are you sure you want to link this case to '+pd_full_name+'? \n\nThis operation cannot be undone.')) {
                $scope.case.$link_personal_details(pd_ref).then(function() {
                  $scope.case.personal_details = pd_ref;

                  personal_details.$get().then(function() {
                    flash('Case linked to '+pd_full_name);

                    postal.publish({channel: 'Person', topic: 'link'});
                  });
                });
              } else {
                $scope.person_q = '';
              }
            }
          });

          $scope.savePersonalDetails = function(form) {
            var pdPromise = $q.defer(),
                adaptationsPromise = $q.defer(),
                mcPromise = $q.defer(),
                selected_adaptation = this.selected_adaptations;

            if ($scope.language.welsh_override) {
              $scope.adaptations.language = 'WELSH';
            }

            // save personal details
            $scope.personal_details.$update($scope.case.reference, function (data) {
              if (!$scope.case.personal_details) {
                $scope.case.personal_details = data.reference;
              }

              postal.publish({channel: 'Person', topic: 'save'});

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
            $scope.case.source = this.source;

            $scope.case.$patch().then(function () {
              $scope.media_code = $scope.case.media_code !== null ? $scope.case.media_code : undefined;
              mcPromise.resolve();
            }, function(err){
              form_utils.ctrlFormErrorCallback($scope, err, form);
              mcPromise.reject(err);
            });

            $scope.personal_details_frm_visible = false;

            return $q.all([pdPromise.promise, adaptationsPromise.promise, mcPromise.promise]);
          };

          $scope.saveThirdParty = function(form) {
            $scope.third_party.$update($scope.case.reference, function (data) {
              if (!$scope.case.thirdparty_details) {
                $scope.case.thirdparty_details = data.reference;
              }

              postal.publish({channel: 'ThirdParty', topic: 'save'});
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
