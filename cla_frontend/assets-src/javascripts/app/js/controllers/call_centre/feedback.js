(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('FeedbackListCtrl',
      ['$scope', 'feedback', 'goToCase', 'FEEDBACK_ISSUE', '_',
        function($scope, feedback, goToCase, FEEDBACK_ISSUE, _) {
          $scope.feedback_list = feedback;
          $scope.goToCase = goToCase;
          $scope.getFormattedFeedback = function(val) {
            return _.find(FEEDBACK_ISSUE, {value:  val});
          };


        }
      ]
    );
})();
