'use strict';
(function(){

  angular.module('cla.directives')

  // use $interval instead of $timeout as interval doesn't block the tests
  .factory('flash', ['$rootScope', '$interval', function ($rootScope, $interval) {
    var messages = [];
    var default_message = 'An error has occured';
    var reset;

    var cleanup = function() {
      $interval.cancel(reset);
      reset = $interval(function() {
        messages = [];
      });
    };

    var emit = function() {
      $rootScope.$emit('flash:message', messages, cleanup);
    };

    $rootScope.$on('$routeChangeSuccess', emit);

    var asMessage = function(level, text) {
      if (text === undefined) {
        text = level;
        level = 'success';
      }
      return {
        level: level,
        text: text || default_message
      };
    };

    var asArrayOfMessages = function(level, text) {
      if (level instanceof Array) {
        return level.map(function(message) {
          return message.text ? message : asMessage(message);
        });
      }

      return text !== undefined ? [{ level: level, text: text || default_message }] : [asMessage(level)];
    };

    return function(level, text) {
      emit(messages = asArrayOfMessages(level, text));
    };
  }])

  .directive('flashMessages', ['$rootScope', '$interval', function ($rootScope, $interval) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/flashMessages.html',
      link: function(scope) {
        scope.messages = [];

        scope.levelClassName = function(level) {
          return level;
        };

        scope.hide = function(_msg) {
          // hides the msg after cancelling the timeout if defined
          $interval.cancel(_msg.timeout);
          scope.messages = _.reject(scope.messages, function(el) { return el === _msg;});
        };

        $rootScope.$on('flash:message', function(__, messages) {
          angular.forEach(messages, function(message) {
            // adding timeout to make msg disappear
            (function(_msg) {
              var f = function() {
                scope.hide(_msg);
              };

              _msg.timeout = $interval(f, 3000);
            })(message);

            // add msg to list
            scope.messages = scope.messages.concat([message]);
          });

          if(!scope.$$phase) {
            scope.$apply();
          }
        });
      }
    };
  }]);

})();
