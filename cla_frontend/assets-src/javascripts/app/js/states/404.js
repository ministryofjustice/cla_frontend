(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || {};

    states.PageNotfound = {
      name: '404',
      url: AppSettings.BASE_URL + 'page-not-found/',
      templateUrl: '404.html'
    };

    mod.states = states;
  }]);
})();
