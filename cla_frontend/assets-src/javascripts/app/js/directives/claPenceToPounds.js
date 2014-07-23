(function() {
  'use strict';

  var app = angular.module('cla.directives');
  app.directive('claPenceToPounds', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModel) {
        function toPounds(text) {

          if (!text) {
            return text;
          }

          var input_as_pence = text || '0';
          return (parseFloat(input_as_pence) / 100);
        }

        function toPence(text) {

          if (!text) {
            return text;
          }

          var input_as_pounds = text || '0';
          return +(parseFloat(input_as_pounds) * 100).toFixed(2);
        }

        ngModel.$parsers.push(toPence);
        ngModel.$formatters.push(toPounds);
      }
    };
  });

})();