'use strict';
(function(){
  angular.module('cla.directives')
    .directive('fullHeight', ['$window', function($window) {
      return {
        restrict: 'A',
        link: function($scope, element) {
          var reCalc = function () {
            var contentHeight = element.height(),
                windowHeight = angular.element($window).height();

            if (windowHeight > contentHeight) {
              element.parents('.Grid-row').height(windowHeight);
            } else {
              element.parents('.Grid-row').height('auto');
            }
          };

          // call initial calc
          reCalc();

          // bind event
          angular.element($window).on('resize.viewport', function () {
            $scope.$apply(reCalc);
          });

          // When the scope is destroyed, be sure to unbind event handler can cause issues.
          $scope.$on('$destroy', function() {
            angular.element($window).off('resize.viewport');
          });
        }
      };
    }]);
})();
