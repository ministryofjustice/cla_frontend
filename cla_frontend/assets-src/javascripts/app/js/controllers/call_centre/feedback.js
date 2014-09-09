(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('FeedbackListCtrl',
      ['$scope', 'feedback', 'goToCase', 'FEEDBACK_ISSUE', '$stateParams', '$state', 'moment',
        function($scope, feedback, goToCase, FEEDBACK_ISSUE, $stateParams, $state, Moment) {
          $scope.feedbackList = feedback;
          $scope.goToCase = goToCase;
          $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
          $scope.start = $stateParams.start ? new Moment($stateParams.start).toDate() : null;
          $scope.end = $stateParams.end ? new Moment($stateParams.end).toDate() : null;

          function toggleField (feedbackItem, field) {
            feedbackItem[field] = !feedbackItem[field];
            return feedbackItem.$patch();
          }

          $scope.toggleJustified = function (feedbackItem) {
            toggleField(feedbackItem, 'justified');
          };

          $scope.toggleResolved = function (feedbackItem) {
            toggleField(feedbackItem, 'resolved');
          };

          $scope.showRow = function (feedbackItem) {
            if ($scope.hide_resolved) {
              return !feedbackItem.resolved;
            }
            return true;
          };

          $scope.filter = function () {
            $state.transitionTo($state.current, {
              start: $scope.start ? new Moment($scope.start).format('YYYY-MM-DD') : null,
              end: $scope.end ?  new Moment($scope.end).format('YYYY-MM-DD') : null,
            }, {
              reload: true,
              inherit: false,
              notify: true
            });
          };
        }
      ]
    );
})();
