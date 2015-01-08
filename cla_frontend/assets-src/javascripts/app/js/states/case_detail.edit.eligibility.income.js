(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityIncome = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.income',
      url: 'income/'
    };

    mod.states = states;
  });
})();
