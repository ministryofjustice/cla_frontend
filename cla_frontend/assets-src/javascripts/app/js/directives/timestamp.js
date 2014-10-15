(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('timestamp', ['$filter', function (filter) {
      return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl:  'directives/timestamp.html',
        scope: {
          date: '=ngModel'
        },
        link: function(scope) {
          var builtInDateFilter = filter('date');
          scope.formattedDate = builtInDateFilter('EEEE, dd MMMM yyyy @ HH:mm', scope.date);
        }
      };
    }]);
}());
