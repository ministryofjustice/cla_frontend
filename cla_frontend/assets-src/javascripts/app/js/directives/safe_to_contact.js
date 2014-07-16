'use strict';
(function(){
  angular.module('cla.directives')
    .directive('safeToContact', function() {
      return {
        restrict: 'E',
        scope: {
          person: '='
        },
        templateUrl: 'directives/safe_to_contact.html',
        link: function(scope) {
          scope.setSafe = function(safe, name) {
            scope.person.contact_safety = {
              'safe': safe,
              'name': name
            };
            scope.showOpts = false;
          };

          scope.iconClass = function () {
            if (typeof scope.person.contact_safety === 'undefined') {
              return 'Icon--call';
            } else if (scope.person.contact_safety.safe === true) {
              return 'Icon--call Icon--green';
            } else if (scope.person.contact_safety.safe === false) {
              return 'Icon--dontcall Icon--red';
            }
          };

          scope.options = [
            {'name': 'Safe to contact', 'safe': true},
            {'name': 'Not safe to call', 'safe': false},
            {'name': 'Not safe to leave a message', 'safe': false}
          ];
        }
      };
    });
})();
