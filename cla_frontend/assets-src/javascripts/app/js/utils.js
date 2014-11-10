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
  ])
    .factory('Papa', ['$window', function ($window) {
      return $window.Papa;
    }
  ])
    .factory('saveAs', ['$window', function ($window) {
      return $window.saveAs;
    }
  ]);

  angular.module('cla.utils')
    .factory('moment', ['$window', function($window){
      return $window.moment;
    }
  ]);

  angular.module('cla.utils')
    .factory('postal', ['$window', function($window){
      return $window.postal;
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
    .factory('url_utils', ['AppSettings', function(AppSettings){
      var url_utils = (function() {
        return {
          BASE_URL: AppSettings.BASE_URL,
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

  angular.module('cla.utils')
    .factory('goToCase', ['$rootScope', '$state', function($rootScope, $state){
      return function(case_reference) {
        $rootScope.$emit('timer:start', {
          success: function() {
            $state.go('case_detail.edit', {
              'caseref': case_reference
            });
          }
        });
      };
    }]);

  angular.module('cla.utils')
    .factory('appUtils', ['AppSettings', function(AppSettings){
      var version;

      return {
        getVersion: function() {
          if (!version) {
            version = $('script[src*="cla.main"]').attr('src').split('.');
            version = version[version.length - 2];
          }

          return version;
        },

        appName: AppSettings.appName
      };
    }]);
})();

