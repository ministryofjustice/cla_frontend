(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackButton', ['AppSettings', '$filter', 'flash', 'postal', function (AppSettings, filter, flash, postal) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'directives/callbackButton.html',
      scope: {
        'case': '='
      },
      link: function (scope, elm) {
        if (!AppSettings.callMeBackEnabled) {
          elm.remove();
        }

        scope.bookCallback = function (e) {
          e.stopPropagation();
          postal.publish({
            channel: 'CallBack',
            topic: 'toggle',
            data: {
              target: elm,
              _case: scope.case
            }
          });
        };
      }
    };
  }]);
})();
