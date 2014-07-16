'use strict';
(function(){
  angular.module('cla.directives')
    .directive('safeToContact', function() {
      return {
        restrict: 'E',
        scope: {
          person: '='
        },
        templateUrl: 'directives/safe_to_call.html',
        link: function(scope, el, attrs) {
          scope.setSafe = function(val) {
            scope.person.safe = val;
            scope.showOpts = false;
          };

          scope.iconClass = function () {
            if (scope.person.safe === 'Not safe to call' || scope.person.safe === 'Not safe to leave a message') {
              return 'Icon--dontcall Icon--red';
            } else if (scope.person.safe === 'Safe to contact') {
              return 'Icon--call Icon--green';
            } else {
              return 'Icon--call';
            }
          };

          scope.options = [
            {'className': 'Icon--tick Icon--green', 'name': 'Safe to contact'},
            {'className': 'Icon--cross Icon--red', 'name': 'Not safe to call'},
            {'className': 'Icon--cross Icon--red', 'name': 'Not safe to leave a message'}
          ];
        }
      };
    });
})();
