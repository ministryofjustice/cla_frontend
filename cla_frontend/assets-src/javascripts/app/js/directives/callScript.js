(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScript', function () {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callScript.html'
    };
  });
})();
