(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetail.views[''].templateUrl = 'call_centre/case_detail.html';

    mod.states = states;
  });
})();
