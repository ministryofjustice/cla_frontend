(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('OutcomesModalCtl',
      ['$scope', 'case', 'event_key', 'outcome_codes', 'notes', 'tplVars', '$modalInstance', '$timeout', 'Feedback',
        function($scope, _case, event_key, outcome_codes, notes, tplVars, $modalInstance, $timeout, Feedback) {
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

          // focus on search field on open
          $modalInstance.opened.then(function () {
            $timeout(function () {
              angular.element('[name="outcome-modal-code-search"]').focus();
            }, 50);
          });

          // on save event
          var onSuccess = function () {
            $scope.$close(true);
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
            _case['$' + event_key]({
              'event_code': $scope.selected.outcome_code,
              'notes': $scope.selected.notes
            }).then(onSuccess, onFail);
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
    )
    .controller('ImplicitOutcomeModalCtl',
      ['$scope', 'case', 'model_action', 'Event', 'notes', 'tplVars',
        function($scope, _case, model_action, Event, notes, tplVars) {
          // template vars
          tplVars = angular.extend({
            'title': 'Outcome code'
          }, tplVars);
          tplVars.buttonText = tplVars.buttonText || tplVars.title;
          $scope.tplVars = tplVars;

          $scope.notes = notes || '';

          $scope.cancel = function () {
            $scope.$dismiss('cancel');
          };

          $scope.post_submit = function(obj) {
            $scope.$close(obj);
          };

          $scope.submit_outcome = function (notes) {
            return _case['$'+model_action]({
              'notes': notes || ''
            });
          };

          $scope.submit = function() {
            $scope.submit_outcome(this.notes)
              .then($scope.post_submit, function(response) {
                $scope.errors = {};
                angular.forEach(response.data, function(errors, field) {
                  $scope.errors[field] = errors.join(', ');
                });
              });
          };

        }
      ]
    );
})();
