(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityDetails = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.details',
      url: 'details/'
    };

    mod.states = states;
  });
})();
