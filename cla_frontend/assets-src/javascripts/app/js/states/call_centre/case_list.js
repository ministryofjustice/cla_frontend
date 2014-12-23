(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseList.templateUrl = 'call_centre/case_list.html';
    states.CaseList.resolve.historicCases = ['$stateParams','HistoricCase', function ($stateParams, HistoricCase) {
      var params = {
        search: $stateParams.search,
        page: $stateParams.hpage
      };
      if (!params.search) {
        return [];
      }
      return HistoricCase.query(params).$promise;
    }];

    mod.states = states;
  });
})();
