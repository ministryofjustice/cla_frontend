(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('timestamp', function() {
      return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl:  'directives/timestamp.html',
        scope: {
          date: '=ngModel'
        }
      };
    });
}());
