'use strict';
(function(){

  angular.module('cla.directives')
  .factory('flash', ['$rootScope', '$interval', function($rootScope, $interval){
    var messages = [],
    default_message = 'something happened, but we are not sure what',
    reset, cleanup, emit, asMessage, asArrayOfMessages;

    cleanup = function() {
      $interval.cancel(reset);
      reset = $interval(function() {
        messages = [];
      });
    };

    emit = function() {
      $rootScope.$emit('flash:message', messages, cleanup);
    };

    $rootScope.$on('$routeChangeSuccess', emit);

    asMessage = function(level, text) {
      if (text === undefined) {
        text = level;
        level = 'success';
      }
      return {
        level: level,
        text: text || default_message
      };
    };

    asArrayOfMessages = function(level, text) {
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
  .directive('flashMessages', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/flash_messages.html',
      controller: function($scope, $rootScope, $interval) {
        $scope.messages = [];

        $scope.levelClassName = function(level) {
          return level;
        };

        $scope.hide = function(_msg) {
          // hides the msg after cancelling the timeout if defined
          $interval.cancel(_msg.timeout);
          $scope.messages = _.reject($scope.messages, function(el) { return el === _msg;});
        };

        $rootScope.$on('flash:message', function(__, messages) {
          angular.forEach(messages, function(message) {
            // adding timeout to make msg disappear only if not error msg
            if (message.level !== 'error') {
              (function(_msg) {
                var f = function() {
                  $scope.hide(_msg);
                };

                _msg.timeout = $interval(f, 3000);
              })(message);
            }

            // add msg to list
            $scope.messages = $scope.messages.concat([message]);
          });
        });
      }
    };
  });

})();
