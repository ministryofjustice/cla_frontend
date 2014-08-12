'use strict';
(function(){
//ROUTES
  angular.module('cla.routes')
    .config(['AppSettings', '$stateProvider', '$locationProvider',
    function(AppSettings, $stateProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      var states = angular.module(AppSettings.statesModule).getStates(AppSettings.BASE_URL);
      angular.forEach(states, function(stateDefinition){
        $stateProvider.state(stateDefinition);
      });
    }]);
})();
