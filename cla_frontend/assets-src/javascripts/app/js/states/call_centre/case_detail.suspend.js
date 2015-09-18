(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailSuspend = {
      parent: 'case_detail',
      name: 'case_detail.suspend',
      url: 'suspend/',
      onEnter: ['$stateParams', '$state', '$modal', 'case', 'eod_details', 'personal_details', 'History', 'flash', 'postal', 'user',
        function($stateParams, $state, $modal, $case, eod_details, personal_details, History, flash, postal, user) {
          var previousState = History.previousState;
          var suspendOpts = {
            templateUrl: 'case_detail.outcome_modal.html',
            controller: 'OutcomesModalCtl',
            resolve: {
              tplVars: function() {
                return {
                  title: 'Suspend case'
                };
              },
              case: function() { return $case; },
              eod_details: function() {return eod_details;},
              event_key: function() { return 'suspend_case'; }, // this is also the function name on Case model
              notes: function () { return null; },
              outcome_codes: ['Event', function (Event) {
                return new Event().list_by_event_key('suspend_case').then(function (response) {
                  //Exclude operator_manager specific codes for non-manager users
                  return _.reject(response.data, function(item) {
                    return !user.is_manager && _.contains(['MRNB', 'MRCC'], item.code);
                  });
                });
              }]
            }
          };
          var onSuspendSuccess = function (result) {
            if (result) {
              flash('success', 'Case ' + $case.reference + ' suspended successfully');
            } else {
              flash('error', 'This case could not be suspended');
            }
            $state.go('case_list');
          };
          var onDismiss = function () {
            var state = previousState.name ? previousState.name : 'case_detail.edit.diagnosis';
            $state.go(state, {caseref: $case.reference});
          };

          var confirmOpts = {
            templateUrl: 'call_centre/confirmation_modal.html',
            controller: 'ConfirmationCtrl',
            resolve: {
              tplVars: function () {
                return {
                  title: 'Missing client information',
                  buttonText: 'Proceed anyway',
                  message: 'Please ensure you have made every attempt to collect at least <strong>a name</strong> and <strong>a postcode or phone number</strong> before suspending a case.'
                };
              }
            }
          };
          var onConfirmSuccess = function () {
            $modal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
          };

          // check personal details before suspending
          if (!personal_details.full_name || (!personal_details.postcode && !personal_details.mobile_phone)) {
            postal.publish({
              channel: 'ConfirmationModal',
              topic: 'warning',
              data: {
                label: 'Suspend case data'
              }
            });
            $modal.open(confirmOpts).result.then(onConfirmSuccess, onDismiss);
          } else {
            $modal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
          }
        }
      ]
    };

    mod.states = states;
  });
})();
