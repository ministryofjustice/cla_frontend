'use strict';
(function(){
  angular.module('cla.directives')

    .directive('feedbackPopover', function() {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/feedbackPopover.html'
      };
    });
})();
