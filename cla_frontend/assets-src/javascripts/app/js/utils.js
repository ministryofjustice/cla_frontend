'use strict';
(function(){

  angular.module('cla.utils')
    .factory('_', ['$window', function($window){
      return $window._;
    }
  ])
    .factory('lunr', ['$window', function($window){
      return $window.lunr;
    }
  ])
    .factory('Raven', ['$window', function($window){
      return $window.Raven;
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
          }
          if (field === '__all__') {
            form.$setValidity('server', false);
          }
          $scope.errors[field] = errors.join(', ');
        });
      }
    };
  });

  angular.module('cla.utils')
    .factory('url_utils', ['BASE_URL', function($BASE_URL){
      var url_utils = (function() {
        return {
          BASE_URL: $BASE_URL,
          url: function(suffix) {
            return url_utils.BASE_URL + suffix;
          },
          proxy: function(suffix) {
            return url_utils.url('proxy/'+suffix);
          }
        };
      })();

      return url_utils;
    }
  ]);

  angular.module('ErrorCatcher', [])
    .factory('$exceptionHandler', ['Raven', function(Raven) {
    return function(exception, cause) {
      Raven.captureException(exception, cause);
    };
  }]);
})();

