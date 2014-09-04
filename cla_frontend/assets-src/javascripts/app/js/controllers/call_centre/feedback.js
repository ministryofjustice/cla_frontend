(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('FeedbackListCtrl',
      ['$scope', 'feedback', 'goToCase', 'FEEDBACK_ISSUE',
        function($scope, feedback, goToCase, FEEDBACK_ISSUE) {
          $scope.feedbackList = feedback;
          $scope.goToCase = goToCase;
          $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;

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
        }
      ]
    );
})();
