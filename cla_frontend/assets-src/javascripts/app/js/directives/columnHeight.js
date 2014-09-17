'use strict';
(function(){
  angular.module('cla.directives')
    .directive('fullHeight', ['$window', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var headerAndFooter = 48;
          scope.initializeWindowSize = function () {
            $(element).css('min-height', $window.innerHeight - headerAndFooter);
          };
          scope.initializeWindowSize();
          angular.element($window).bind('resize', function () {
            scope.initializeWindowSize();
          });
        }
      };
    }]);
})();
