(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.HistoricCaseList = {
      name: 'historic_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'historic/?search?page',
      templateUrl: 'call_centre/historic_case_list.html',
      controller: 'HistoricCaseListCtrl',
      resolve: {
        historicCases: ['$stateParams', 'HistoricCase',
          function ($stateParams, HistoricCase) {
          var params = {
            search: $stateParams.search,
            page: $stateParams.page
          };
          if (!params.search) {
            return {count:0, results: []};
          }
          return HistoricCase.query(params).$promise;
        }]
      }
    };

    mod.states = states;
  }]);
})();
