'use strict';
(function(){
  // register the interceptor as a service
  angular.module('cla.services')
    .factory('cla.httpInterceptor', ['$q', 'flash', '$injector', '$sce', 'form_utils', function($q, flash, $injector, $sce, form_utils) {
    return {
      // optional method
      responseError: function(rejection) {
      	var ignoreExceptions = rejection.config.ignoreExceptions || [];

      	if (ignoreExceptions.indexOf(rejection.status) <= -1) {
      		var msgs = {
	      			500: 'Server error! Please try again later. If the problem persists, please contact the administrator.',
	      			405: 'You are not allowed to perform this action on this resource.',
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
                        url: '/call_centre/login/',
                        method: 'POST',
                        data: $.param({
                          username: this.username,
                          password: this.password,
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
    $httpProvider.interceptors.push('cla.httpInterceptor');

    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

  }]);
})();