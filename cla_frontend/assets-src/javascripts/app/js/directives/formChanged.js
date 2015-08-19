(function(){
  'use strict';

  // labels a form as changed if change event was called
  // similar to $dirty, but that doesn't change at the right time for eligibility check
  angular.module('cla.directives')
    .directive('formChanged', function() {
      return {
        restrict: 'A',
        link: function(scope, element) {
          element.on("change", function() {
            scope.formDidChange = true;
         });
       }
      };
    });

})();
