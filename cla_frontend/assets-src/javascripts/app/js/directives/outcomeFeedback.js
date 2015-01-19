(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('outcomeFeedback', ['FEEDBACK_ISSUE', function (FEEDBACK_ISSUE) {
    return {
      restrict: 'E',
      templateUrl: 'directives/outcomeFeedback.html',
      scope: {
        'issue': '=',
        'outcomeCode': '=',
        'form': '=',
        'submitted': '='
      },
      link: function (scope, elm) {
        scope.issues = FEEDBACK_ISSUE; // possible reasons
        scope.showFeedback = false; // default show value

        scope.shouldLeaveFeedback = function () {
          return scope.showFeedback || (scope.outcomeCode === 'MIS');
        };
      }
    };
  }]);
})();
