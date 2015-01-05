'use strict';
(function(){

  angular.module('cla.directives')
    .directive('systemMessage', ['$rootScope', function ($rootScope) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/systemMessage.html',
        link: function(scope) {
          $rootScope.$on('system:message', function(event, msg, closeable) {
            scope.message = msg;
            scope.isCloseable = closeable || false;
          });

          scope.clearMessage = function () {
            if (scope.isCloseable) {
              scope.message = null;
            }
          };
        }
      };
    }]);

})();
