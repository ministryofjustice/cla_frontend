(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityExpenses = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.expenses',
      url: 'expenses/'
    };

    mod.states = states;
  });
})();
