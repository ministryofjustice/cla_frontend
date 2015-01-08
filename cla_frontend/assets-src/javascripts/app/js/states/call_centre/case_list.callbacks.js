(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.Callbacks = {
      name: 'callbacks',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'callbacks/',
      templateUrl: 'call_centre/case_list.callbacks.html',
      controller: 'CallbacksCtrl'
    };

    mod.states = states;
  }]);
})();
