(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScriptToggle', ['$rootScope', 'localStorageService', 'AppSettings', 'postal', function ($rootScope, localStorageService, AppSettings, postal) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callScriptToggle.html',
      link: function (scope, elm) {
        // remove if not enabled
        if (!AppSettings.callScriptEnabled) {
          elm.remove();
          return;
        }

        if (localStorageService.get('showCallScript') === null) {
          $rootScope.showCallScript = true;
        } else {
          $rootScope.showCallScript = (localStorageService.get('showCallScript') === 'true');
        }

        scope.state = function () {
          return $rootScope.showCallScript ? 'on' : 'off';
        };

        scope.toggle = function () {
          $rootScope.showCallScript = !$rootScope.showCallScript;
          localStorageService.set('showCallScript', $rootScope.showCallScript);

          if ($rootScope.showCallScript) {
            postal.publish({channel: 'CallScript', topic: 'show'});
          } else {
            postal.publish({channel: 'CallScript', topic: 'hide'});
          }
        };
      }
    };
  }]);
})();
