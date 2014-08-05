'use strict';
(function(){
  // register the interceptor as a service
  angular.module('cla.services')
    .factory('cla.httpInterceptor', ['$q', 'flash', function($q, flash) {
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
	      			0: 'Your internet connection seems down, please check and try again.'
	      		},
      			msg = msgs[rejection.status] || 'Error!';
      		
      		if (angular.isFunction()) {
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
  }]);
})();
