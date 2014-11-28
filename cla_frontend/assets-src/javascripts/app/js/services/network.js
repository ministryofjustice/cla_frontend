'use strict';
(function(){
  // register the interceptor as a service
  angular.module('cla.services')
    .factory('cla.httpInterceptor.uniqueThrottleInterceptor', function ($injector, $q) {
      var DUPLICATE_REQUEST_STATUS_CODE = 420; // Twitter 'Enhance Your Calm' status code

      function compare_predicate(v, k) {
        return k.length > 0 && k[0] !== '$';
      }

      function makeEnhanceYourCalmResponse(config) {
        return {
          data: '',
          headers: {},
          status: DUPLICATE_REQUEST_STATUS_CODE,
          config: config
        };
      }

      function isRequestPending(config) {
        var $http = $injector.get('$http');
        var pending = $http.pendingRequests.filter(function (pendingReqConfig) {
          return (pendingReqConfig.method === config.method &&
            pendingReqConfig.url === config.url &&
            _.isEqual(_.pick(pendingReqConfig.data, compare_predicate), _.pick(config.data, compare_predicate))
            );
        });
        return pending.length > 0;
      }

      return {
        request:  function(config) {
          var deferred = $q.defer();

          if (config.method !== 'GET' && isRequestPending(config)) {
            deferred.reject(makeEnhanceYourCalmResponse(config));
          }
          deferred.resolve(config);
          return deferred.promise;
        }
      };
    }
  )
    .factory('cla.httpInterceptor', ['$q', 'flash', '$injector', '$sce', 'form_utils', 'url_utils', 'postal',
      function($q, flash, $injector, $sce, form_utils, url_utils, postal) {
    return {
      // optional method
      responseError: function(rejection) {
        var ignoreExceptions = rejection.config.ignoreExceptions || [];

        if (ignoreExceptions.indexOf(rejection.status) <= -1) {
          var msgs = {
              500: 'Server error! Please try again later. If the problem persists, please contact the administrator.',
              405: 'You are not allowed to perform this action on this resource.',
              420: function () {
                postal.publish({
                  channel: 'ServerError',
                  topic: 420
                });
              },
              404: 'Resource cannot be found.',
              403: 'You don\'t have permissions to access this page.',
              401: function() {
                if ($('form[name=login_frm]').length) {
                  return;
                }

                var $modal = $injector.get('$modal'),
                    $http = $injector.get('$http');

                $modal.open({
                  templateUrl: 'includes/login.html',
                  controller: function($scope) {
                    $scope.login = function(form) {
                      $http({
                        url: url_utils.url('login/'),
                        method: 'POST',
                        data: $.param({
                          username: this.username,
                          password: this.password
                        }),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                          }
                      }).then(
                        function() {
                          flash('You are now logged in.');
                          $scope.$close();
                        },
                        function(response){
                          form_utils.ctrlFormErrorCallback($scope, response, form);
                        }
                      );
                    };
                  }
                });
              },
              400: angular.noop,
              0: 'Your internet connection seems down, please check and try again.'
            },
            msg = msgs[rejection.status] || 'Error!';

          if (angular.isFunction(msg)) {
            msg = msg();
          }

          if (msg) {
            flash('error', msg);
          }
        }

        return $q.reject(rejection);
      }
    };
  }]).config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('cla.httpInterceptor.uniqueThrottleInterceptor');
      $httpProvider.interceptors.push('cla.httpInterceptor');

      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    }]);
})();
