'use strict';
(function(){
  angular.module('cla.directives')
    .directive('claServerValidate', [function() {
      return {
        restrict: 'E',
        scope: {
          for: '@for'
        },
        link: function ($scope) {
          var offWarningWatch, offErrorWatch;
          offWarningWatch = $scope.$parent.$watch('warnings.' + $scope.for, function (newVal) {
            $scope.warnings_for = newVal;
          });
          offErrorWatch = $scope.$parent.$watch('errors.' + $scope.for, function (newVal) {
            $scope.errors_for = newVal;
          });
          $scope.$on('$destroy', function () {
            offWarningWatch();
            offErrorWatch();
          });
        },
        templateUrl: 'directives/form.warning.html'
      };
    }]);
})();

