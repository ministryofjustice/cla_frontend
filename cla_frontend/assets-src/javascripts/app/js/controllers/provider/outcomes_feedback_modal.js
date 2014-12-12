(function(){
  'use strict';

  angular.module('cla.controllers.provider')
      .controller('OutcomesFeedbackModalCtl',
      ['$scope', 'case', 'event_key', 'Event', 'notes', 'tplVars',
        '$controller', 'FEEDBACK_ISSUE', '$q', 'Feedback', 'form_utils',
        function ($scope, _case, event_key, Event, notes, tplVars,
                  $controller, FEEDBACK_ISSUE, $q, Feedback, form_utils) {
          angular.extend(this, $controller('OutcomesModalCtl', {
            $scope: $scope,
            case: _case,
            event_key: event_key,
            Event: Event,
            notes: notes,
            tplVars: tplVars
          }));
          $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
          $scope.leaveFeedback = false;
          $scope.feedback = {case: _case.reference};

          $scope.shouldLeaveFeedback = function (code) {
            return $scope.leaveFeedback || (code||'') === 'MIS';
          };

          $scope.submit_feedback = function (comment, form) {
            var feedback_resource = new Feedback(angular.extend($scope.feedback, {comment: comment}));
            return feedback_resource.$save(angular.noop, function (data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            });
          };

          $scope.submit = function (form) {
            var that = this,
                feedback_promise = $scope.shouldLeaveFeedback(this.event_code) ? $scope.submit_feedback(that.notes, form) : $q.when(true);
                feedback_promise.then(function () {
                  return $scope.submit_outcome(that.event_code, that.notes).then($scope.post_submit, function (data) {
                    form_utils.ctrlFormErrorCallback($scope, data, form);
                  });
                });
          };
        }
      ]);
})();
