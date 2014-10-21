(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScript', ['AppSettings', function (AppSettings) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callScript.html',
      link: function (scope, elm) {
        // remove if not enabled
        if (!AppSettings.callScriptEnabled) {
          elm.remove();
          return;
        }
      }
    };
  }]);
})();
