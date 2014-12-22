(function () {
  'use strict';

  var mod = angular.module('cla.states.provider');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEdit.views['@case_detail'].templateUrl = 'provider/case_detail.edit.html';

    mod.states = states;
  });
})();
