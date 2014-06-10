'use strict';
(function(){
  // register the interceptor as a service
  angular.module('cla.services')
    .factory('cla.httpInterceptor', ['$q', 'flash', function($q, flash) {
    return {
      // optional method
      responseError: function(rejection) {
        switch(rejection.status) {
          case 500:
            flash('error', 'Server error! Please try again later. If the problem persists, please contact the administrator.');
            break;
          case 403:
            flash('error', 'You don\'t have have permission to access this page.');
            break;
          case 0:
            flash('error', 'Your internet connection seems down, please check and try again.');
            break;
            // default:
            //     flash('error', '');
        }

        return $q.reject(rejection);
      }
    };
  }]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('cla.httpInterceptor');
  }]);
})();
