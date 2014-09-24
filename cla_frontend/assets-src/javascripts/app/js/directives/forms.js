'use strict';
(function(){


  angular.module('cla.directives')
  .directive('serverError', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ctrl) {
        element.on('change blur', function() {
          scope.$apply(function() {
            ctrl.$setValidity('server', true);
            ctrl.$validate();
          });
        });
      }
    };
  });

})();
