(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScriptToggle', ['$rootScope', 'localStorageService', 'AppSettings', function ($rootScope, localStorageService, AppSettings) {
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
        };
      }
    };
  }]);
})();
