(function() {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEODDetails = {
      parent: 'case_detail',
      name: 'case_detail.eod_details',
      url: 'eod-details/',
      onEnter: ['$stateParams', '$state', '$modal', 'case', 'eod_details', 'History', 'flash',
        function($stateParams, $state, $modal, $case, eod_details, History, flash) {

          var previousState = History.previousState;

          var onConfirmSuccess = function(result) {
            if (result) {
              flash('success', 'Expressions of dissatisfaction for case ' + $case.reference + ' saved successfully');
            } else {
              flash('error', 'Expressions of dissatisfaction not saved');
            }

            // $state.go('case_list');

            var state = previousState.name ? previousState.name : 'case_detail.edit.diagnosis';
            $state.go(state, {caseref: $case.reference});
          };

          var onDismiss = function() {
            var state = previousState.name ? previousState.name : 'case_detail.edit.diagnosis';
            $state.go(state, {caseref: $case.reference});
          };

          $modal.open({
            templateUrl: 'call_centre/case_detail.eod_details_modal.html',
            controller: 'EODDetailsModalCtrl',
            resolve: {
              tplVars: function () {
                return {
                  title: 'Expressions of Dissatisfaction'
                };
              },
              case: function() {
                return $case;
              },
              eod_details: function() {
                return eod_details;
              }
            }
          }).result.then(onConfirmSuccess, onDismiss);
        }
      ]
    };

    mod.states = states;
  });
})();
