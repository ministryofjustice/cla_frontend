(function () {
  'use strict';

  angular.module('cla.directives')
    .directive('assetMinimum', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
          ngModel.$validators.assetMinimum = function (modelValue) {
            return ngModel.$isEmpty(modelValue) ||
              modelValue === 0 ||
              modelValue >= 50000;
          };
        }
      };
    });
})();