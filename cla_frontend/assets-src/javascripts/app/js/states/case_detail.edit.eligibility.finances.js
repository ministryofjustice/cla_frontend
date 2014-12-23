(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityFinances = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.finances',
      url: 'finances/'
    };

    mod.states = states;
  });
})();
