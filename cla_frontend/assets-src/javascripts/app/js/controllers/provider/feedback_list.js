(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('FeedbackListCtrl',
    ['$scope', '$uibModal', 'feedbackList', 'FEEDBACK_ISSUE', '_', 'Feedback',
      function ($scope, $uibModal, feedbackList, FEEDBACK_ISSUE, _, Feedback) {
        $scope.feedbackList = feedbackList;
        $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
        $scope.getFormattedFeedback = function(val) {
          return _.find(FEEDBACK_ISSUE, {value:  val});
        };

        $scope.submit = function () {
          var feedback_resource = new Feedback(angular.extend({
            case: $scope.case.reference
          }, $scope.newFeedback));
          return feedback_resource.$save().then(function () {
            Feedback.query({case: $scope.case.reference}).$promise.then(function (val) {
              $scope.feedbackList = val;
              $scope.newFeedback = {};
            });
          });
        };
      }
    ]
  );
})();
