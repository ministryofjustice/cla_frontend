(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('OutcomesModalCtl',
      ['$scope', 'case', 'eod_details', 'event_key', 'outcome_codes', 'notes', 'tplVars', '$uibModalInstance', '$timeout', 'flash', 'postal', 'Feedback', 'Complaint',
        function($scope, _case, eod_details, event_key, outcome_codes, notes, tplVars, $uibModalInstance, $timeout, flash, postal, Feedback, Complaint) {
          // template vars
          tplVars = angular.extend({
            'title': 'Outcome code'
          }, tplVars);
          tplVars.buttonText = tplVars.buttonText || tplVars.title;
          $scope.tplVars = tplVars;
          $scope.outcome_codes = outcome_codes;
          $scope.selected = {};
          $scope.selected.notes = notes || '';
          $scope.feedback_allowed = (event_key === 'reject_case');

          if(eod_details !== null) {
            if(_case.complaint_flag) {
              $scope.ircb_escalates = 'escalated';
            } else if(eod_details.isEODSet()) {
              $scope.ircb_escalates = 'will_escalate';
            } else {
              $scope.ircb_escalates = 'cant_escalate';
            }
          }

          // focus on search field on open
          $uibModalInstance.opened.then(function () {
            $timeout(function () {
              angular.element('[name="outcome-modal-code-search"]').focus();
            }, 50);
          });

          // on save event
          var onSuccess = function (response) {
            $scope.$close(response);
          };
          var onFail = function (response) {
            $scope.errors = {};
            angular.forEach(response.data, function (errors, field) {
              if (Array.isArray(errors)) {
                $scope.errors[field] = errors.join(', ');
              } else {
                $scope.errors[field] = errors;
              }
            });
          };
          var saveEvent = function () {
            function doSave() {
              _case['$' + event_key]({
                event_code: $scope.selected.outcome_code,
                notes: $scope.selected.notes
              }).then(onSuccess, onFail);
            }
            if(eod_details !== null && $scope.ircb_escalates === 'will_escalate' && $scope.selected.outcome_code === 'IRCB') {
              var complaint = new Complaint({
                eod: eod_details.reference,
                // copy IRCB notes into complaint description (EOD notes go into created log event)
                description: $scope.selected.notes ? 'IRCB notes: ' + $scope.selected.notes : ''
              });
              complaint.$update(function() {
                _case.complaint_flag = true;  // could go _case.$get but that might wipe other changes

                postal.publish({
                  channel: 'Complaint',
                  topic: 'save',
                  data: complaint
                });
                flash('success', 'EOD escalated to complaint');
                doSave();
              }, function() {
                flash('error', 'EOD not escalated to complaint');
                doSave();
              });
            } else {
              doSave();
            }
          };

          $scope.submit = function(isValid) {
            if (isValid) {
              if ($scope.selected.issue) {
                var feedback_resource = new Feedback({
                  case: _case.reference,
                  issue: $scope.selected.issue,
                  comment: $scope.selected.notes
                });

                feedback_resource.$save(function () {
                  saveEvent();
                }, onFail);
              } else {
                saveEvent();
              }
            }
          };

          $scope.cancel = function () {
            $scope.$dismiss('cancel');
          };
        }
      ]
    );
})();
