'use strict';
(function(){

  angular.module('cla.utils')
    .factory('_', ['$window', function($window){
      return $window._;
    }
  ]);

  angular.module('cla.utils')
    .factory('lunr', ['$window', function($window){
      return $window.lunr;
    }
  ]);

  angular.module('cla.utils')
    .factory('form_utils', function(){
    return {
      ctrlFormErrorCallback: function($scope, response, form) {
        // response can be response or data (if it needs to be overridden)
        var data = (response.status === undefined) ? response : response.data;

        $scope.errors = {};
        angular.forEach(data, function(errors, field) {
          if (form[field] !== undefined) {
            form[field].$setValidity('server', false);
            $scope.errors[field] = errors.join(', ');
          }
          if (field === '__all__') {
            form.$setValidity('server', false);
            $scope.errors[field] = errors.join(', ');
          }
        });
      }
    };
  });

})();

