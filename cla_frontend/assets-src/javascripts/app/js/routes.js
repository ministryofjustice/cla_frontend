(function(){
  'use strict';

  //ROUTES
  angular.module('cla.routes')
    .config(['AppSettings', '$stateProvider', '$locationProvider', '$urlRouterProvider',
    function(AppSettings, $stateProvider, $locationProvider, $urlRouterProvider) {
      $locationProvider.html5Mode(true);

      var states = angular.module(AppSettings.statesModule).getStates(AppSettings.BASE_URL);
      angular.forEach(states, function (stateDefinition) {
        $stateProvider.state(stateDefinition);
      });

      $stateProvider.state('404', {
        name: '404',
        url: AppSettings.BASE_URL + 'page-not-found/',
        templateUrl: '404.html'
      });

      $urlRouterProvider
        .otherwise(AppSettings.BASE_URL + 'page-not-found/')
        .rule(function($injector, $location) {
          var path = $location.url();

          // check to see if the path already has a slash where it should be
          if (path[path.length - 1] === '/' || path.indexOf('/?') > -1) {
            return;
          }

          if (path.indexOf('?') > -1) {
            return path.replace('?', '/?');
          }

          return path + '/';
        });
    }]);
})();
