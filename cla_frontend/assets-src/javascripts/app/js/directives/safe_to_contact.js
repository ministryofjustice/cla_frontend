'use strict';
(function(){
  angular.module('cla.directives')
    .directive('safeToContact', ['CONTACT_SAFETY', '_', function(CONTACT_SAFETY, _) {
      return {
        restrict: 'E',
        scope: {
          person: '='
        },
        templateUrl: 'directives/safe_to_contact.html',
        link: function(scope) {

          var lookup = {
            'Safe to contact': CONTACT_SAFETY.SAFE,
            'Not safe to call': CONTACT_SAFETY.DONT_CALL,
            'Not safe to leave a message': CONTACT_SAFETY.NO_MESSAGE
          }, name;

          function get_value(name) {
            return lookup[name];
          }

          function on_change(value) {
            if (value) {
              name = _.invert(lookup)[value];
              scope.setSafe(_.find(scope.options, {name: name}).safe, name);
            }
          }


          scope.setSafe = function(safe, name) {
            scope.person.contact_safety = {
              'safe': safe,
              'name': name
            };
            scope.person.safe_to_contact = get_value(name);
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

          scope.$watch('person.safe_to_contact', on_change);
          on_change(scope.person.safe_to_contact);

        }
      };
    }]);
})();
