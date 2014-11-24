(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackStatus', ['AppSettings', '$filter', 'flash', 'postal', function (AppSettings, filter, flash, postal) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callbackStatus.html',
      scope: {
        'case': '='
      },
      link: function (scope, elm) {
        // remove if not enabled
        if (!AppSettings.callMeBackEnabled) {
          elm.remove();
          return;
        }

        var builtInDateFilter = filter('date');

        scope.time = builtInDateFilter(scope.case.getCallbackDatetime(), 'HH:mm \'on\' d MMM yy');

        scope.completeCallback = function() {
          scope.case.$complete_call_me_back().then(function() {
            scope.case.requires_action_at = null;
            scope.case.callback_attempt = 0;

            elm.remove();
            flash('Callback stopped successfully');
            // refreshing the logs
            postal.publish({
              channel : 'models',
              topic   : 'Log.refresh'
            });
          });
        };

        if (!scope.time) {
          elm.remove();
          return;
        }
      }
    };
  }]);
})();
