(function(){
  'use strict';

  //ROUTES
  angular.module('cla.routes')
    .config(['AppSettings', '$stateProvider', '$locationProvider', '$urlRouterProvider',
    function(AppSettings, $stateProvider, $locationProvider, $urlRouterProvider) {
      $locationProvider.html5Mode(true);

      var states = angular.module(AppSettings.statesModule).states;

      angular.forEach(states, function (stateDefinition) {
        $stateProvider.state(stateDefinition);
      });

      // handle angular 404s
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
