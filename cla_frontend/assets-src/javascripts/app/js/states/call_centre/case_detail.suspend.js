(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailSuspend = {
      parent: 'case_detail',
      name: 'case_detail.suspend',
      url: 'suspend/',
      onEnter: ['$stateParams', '$state', '$modal', 'case', 'personal_details', 'History', 'flash', function($stateParams, $state, $modal, $case, personal_details, History, flash) {
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
            event_key: function() { return 'suspend_case'; }, // this is also the function name on Case model
            notes: function() { return ''; }
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
          var state = previousState.name ? previousState.name : 'case_detail.edit';
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
          $modal.open(confirmOpts).result.then(onConfirmSuccess, onDismiss);
        } else {
          $modal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
        }
      }]
    };

    mod.states = states;
  });
})();
