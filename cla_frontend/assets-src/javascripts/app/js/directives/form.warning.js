'use strict';
(function(){
  angular.module('cla.directives')
    .directive('claServerWarning', ['$parse', function($parse) {
      return {
        restrict: 'E',
        scope: {
          for: '@for'
        },
        link: function ($scope) {
          $scope.$parent.$watch('warnings.'+$scope.for, function (newVal) {
            $scope.warnings_for = newVal;
          });
        },
        templateUrl: '/static/javascripts/app/partials/directives/form.warning.html'
      };
    }]);
})();

