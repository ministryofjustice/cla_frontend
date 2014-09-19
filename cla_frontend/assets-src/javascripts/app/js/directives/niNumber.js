(function(){
  'use strict';

  var NI_REGEXP = /^\s*([a-zA-Z]){2}(\s*[0-9]\s*){6}([a-zA-Z]){1}?$/;

  angular.module('cla.directives')
    .directive('niNumber', function() {
      return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
          ctrl.$parsers.unshift(function(viewValue) {
            if (viewValue === '' || NI_REGEXP.test(viewValue.replace(/ /g,''))) {
              ctrl.$setValidity('nino', true);
              return viewValue;
            } else {
              ctrl.$setValidity('nino', false);
              return undefined;
            }
          });
        }
      };
    });
})();
