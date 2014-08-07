'use strict';
(function(){

  angular.module('cla.controllers',[]);
  angular.module('cla.services',['ngResource']);
  angular.module('cla.filters',[]);
  angular.module('cla.directives',[]);
  angular.module('cla.states',[]);
  angular.module('cla.utils',[]);
  angular.module('cla.templates',[]);
  angular.module('cla.routes',[]);


  // Operator App

  angular.module('cla.operatorSettings', []).constant('AppSettings', {
    BASE_URL: '/call_centre/',
    timerEnabled: function() {
      return true;
    }
  });
  
  angular.module('cla.operatorApp',
    [
      'cla.operatorSettings',
      'ngSanitize',
      'angularMoment',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.services',
      'cla.filters',
      'cla.directives',
      'cla.states',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'sticky'
    ])
    .config(function($resourceProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
    })
    .run(function ($rootScope, $state, $stateParams, Timer) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      Timer.install();
    });


  // Provider App

  angular.module('cla.providerSettings', []).constant('AppSettings', {
    BASE_URL: '/provider/',
    timerEnabled: function() {
      return false;
    }
  });

  angular.module('cla.providerApp',
    [
      'cla.providerSettings',
      'ngSanitize',
      'angularMoment',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.services',
      'cla.filters',
      'cla.directives',
      'cla.states',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select',
      'multi-select',
      'sticky'
    ])
    .config(['$resourceProvider', '$provide', function($resourceProvider, $provide) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
      
      // multi select
      $provide.decorator('multiSelectDirective', function($delegate) {
        var directive = $delegate[0];
        directive.template = undefined;
        directive.templateUrl = 'directives/multi_select.html';
        return $delegate;
      });
    }])
    .run(function ($rootScope, $state, $stateParams, Timer) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      Timer.install();
    });

})();
