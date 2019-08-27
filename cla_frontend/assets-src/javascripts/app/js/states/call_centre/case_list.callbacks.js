(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.Callbacks = {
      name: 'case_list.callbacks',
      parent: 'case_list',
      url: 'callbacks/?category',
      resolve: {
        cases: ['$stateParams', 'Case', function ($stateParams, Case){
          return Case.query_future_callbacks($stateParams).$promise;
        }]
      },
      views: {
        'list-content@case_list': {
          templateUrl: 'call_centre/case_list.callbacks.html',
          controller: 'CallbacksCtrl'
        }
      }
    };

    mod.states = states;
  });
})();
