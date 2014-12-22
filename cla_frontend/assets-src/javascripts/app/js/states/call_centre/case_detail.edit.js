(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEdit.views['@case_detail'].templateUrl = 'call_centre/case_detail.edit.html';

    mod.states = states;
  });
})();
