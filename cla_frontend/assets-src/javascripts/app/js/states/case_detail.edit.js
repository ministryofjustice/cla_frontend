(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEdit = {
      parent: 'case_detail',
      name: 'case_detail.edit',
      url: '',
      views: {
        '@case_detail': {
          templateUrl: 'case_detail.edit.html',
          controller: 'CaseDetailEditCtrl'
        }
      }
    };

    mod.states = states;
  });
})();
