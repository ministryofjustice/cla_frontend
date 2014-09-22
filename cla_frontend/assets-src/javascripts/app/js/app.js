'use strict';
(function(){
  angular.module('cla.controllers',[]);
  angular.module('cla.services',['ngResource']);
  angular.module('cla.services.operator', ['ngResource', 'cla.services']);
  angular.module('cla.services.provider', ['ngResource', 'cla.services']);
  angular.module('cla.filters',[]);
  angular.module('cla.directives',[]);
  angular.module('cla.states',[]);
  angular.module('cla.utils',[]);
  angular.module('cla.templates',[]);
  angular.module('cla.routes', ['cla.states']);


  // Operator App

  angular.module('cla.states.operator',['cla.states']);
  angular.module('cla.controllers.operator',[]);
  angular.module('cla.settings.operator', []).constant('AppSettings', {
    BASE_URL: '/call_centre/',
    timerEnabled: function() {
      return true;
    },
    statesModule: 'cla.states.operator'
  });

  angular.module('cla.operatorApp',
    [
      'cla.settings.operator',
      'cla.states',
      'ngSanitize',
      'ngMessages',
      'angularMoment',
      'angular-blocks',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.controllers.operator',
      'cla.services',
      'cla.services.operator',
      'cla.filters',
      'cla.directives',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'sticky',
      'angular-loading-bar',
      'angulartics',
      'angulartics.piwik'
    ])
    .config(function($resourceProvider, cfpLoadingBarProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
      cfpLoadingBarProvider.includeBar = false;
    })
    .run(function ($rootScope, $state, $stateParams, Timer, flash) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      // handle state change errors
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
        // generic state change error / redirect
        if (error.msg) {
          flash('error', error.msg);
        }

        if (error.goto) {
          $state.go(error.goto, {caseref: error.case});
        }
      });


      Timer.install();
    });


  // Provider App

  angular.module('cla.states.provider',['cla.states']);
  angular.module('cla.controllers.provider',[]);
  angular.module('cla.settings.provider', []).constant('AppSettings', {
    BASE_URL: '/provider/',
    timerEnabled: function() {
      return false;
    },
    statesModule: 'cla.states.provider'
  });

  angular.module('cla.providerApp',
    [
      'cla.settings.provider',
      'cla.states',
      'ngSanitize',
      'ngMessages',
      'angularMoment',
      'angular-blocks',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.controllers.provider',
      'cla.services',
      'cla.services.provider',
      'cla.filters',
      'cla.directives',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'sticky',
      'angular-loading-bar',
      'angulartics',
      'angulartics.piwik'
    ])
    .config(function($resourceProvider, cfpLoadingBarProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
      cfpLoadingBarProvider.includeBar = false;
    })
    .run(function ($rootScope, $state, $stateParams, Timer) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      Timer.install();
    });

})();
