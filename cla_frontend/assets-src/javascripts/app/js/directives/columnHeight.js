'use strict';
(function(){
  angular.module('cla.directives')
    .directive('fullHeight', ['$window', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var headerHeight = angular.element('#global-header').outerHeight();
          var caseBarHeight = angular.element('.CaseBar').outerHeight();
          var headerFooterPadding = headerHeight + caseBarHeight;

          scope.initializeWindowSize = function () {
            $(element).css('min-height', $window.innerHeight - headerFooterPadding);
          };
          scope.initializeWindowSize();
          angular.element($window).bind('resize', function () {
            scope.initializeWindowSize();
          });
        }
      };
    }]);
})();
