'use strict';
(function(){
  angular.module('cla.directives')
    .directive('safeToContact', ['CONTACT_SAFETY', 'postal', function(CONTACT_SAFETY, postal) {
      return {
        restrict: 'E',
        scope: {
          person: '='
        },
        templateUrl: 'directives/safe_to_contact.html',
        link: function(scope) {

          var lookup = {
            'Safe to contact': CONTACT_SAFETY.SAFE,
            'Not safe to call': CONTACT_SAFETY.DONT_CALL
          };

          scope.setSafe = function(name) {
            scope.person.safe_to_contact = lookup[name];
            scope.showOpts = false;

            postal.publish({
              channel: 'SafeToContact',
              topic: 'change',
              data: {
                label: name
              }
            });
          };

          scope.iconClass = function () {
            switch(scope.person.safe_to_contact) {
              case CONTACT_SAFETY.SAFE:
                return 'Icon--call Icon--green';
              case CONTACT_SAFETY.DONT_CALL:
                return 'Icon--dontcall Icon--red';
              default:
                return 'Icon--call';
            }
          };

          scope.options = [
            {'name': 'Safe to contact', 'value': CONTACT_SAFETY.SAFE},
            {'name': 'Not safe to call', 'value': CONTACT_SAFETY.DONT_CALL}
          ];
        }
      };
    }]);
})();
