(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('FeedbackListCtrl',
      ['$scope', 'feedback', 'FEEDBACK_ISSUE', '$stateParams', '$state', 'moment',
        function($scope, feedback, FEEDBACK_ISSUE, $stateParams, $state, Moment) {
          $scope.feedbackList = feedback;
          $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
          $scope.startDate = $stateParams.start ? new Moment($stateParams.start).format('DD/MM/YYYY') : null;
          $scope.endDate = $stateParams.end ? new Moment($stateParams.end).format('DD/MM/YYYY') : null;

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
            if ($scope.hideResolved) {
              return !feedbackItem.resolved;
            }
            return true;
          };

          $scope.filter = function () {
            var start = $scope.startDate ? new Moment($scope.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD H:m') : null;
            var end = $scope.endDate ? new Moment($scope.endDate, 'DD/MM/YYYY').hour(23).minute(59).format('YYYY-MM-DD H:m') : null;

            $state.transitionTo($state.current, {
              start: start,
              end: end,
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
