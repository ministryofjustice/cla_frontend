(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScriptToggle', ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callScriptToggle.html',
      link: function (scope) {
        if (localStorageService.get('showCallScript') === null) {
          $rootScope.showCallScript = true;
        } else {
          $rootScope.showCallScript = (localStorageService.get('showCallScript') === 'true');
        }

        scope.toggle = function () {
          $rootScope.showCallScript = !$rootScope.showCallScript;
          localStorageService.set('showCallScript', $rootScope.showCallScript);
        };
      }
    };
  }]);
})();
