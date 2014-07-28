'use strict';
(function(){

  angular.module('cla.directives')
  .factory('flash', ['$rootScope', '$timeout', function($rootScope, $timeout){
    var messages = [],
    default_message = 'something happened, but we are not sure what',
    reset, cleanup, emit, asMessage, asArrayOfMessages;

    cleanup = function() {
      $timeout.cancel(reset);
      reset = $timeout(function() {
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
      controller: function($scope, $rootScope, $timeout) {
        $scope.messages = [];

        $scope.levelClassName = function(level) {
          return level;
        };

        $scope.hide = function(_msg) {
          // hides the msg after cancelling the timeout if defined
          $timeout.cancel(_msg.timeout);
          $scope.messages = _.reject($scope.messages, function(el) { return el === _msg;});
        };

        $rootScope.$on('flash:message', function(__, messages, done) {
          angular.forEach(messages, function(message) {
            // adding timeout to make msg disappear only if not error msg
            if (message.level !== 'error') {
              (function(_msg) {
                var f = function() {
                  $scope.hide(_msg);
                };

                _msg.timeout = $timeout(f, 3000);
              })(message);
            }

            // add msg to list
            $scope.messages = $scope.messages.concat([message]);
          });

          done();
        });
      }
    };
  });

})();
