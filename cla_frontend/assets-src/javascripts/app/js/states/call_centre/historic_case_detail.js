(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.HistoricCaseDetail = {
      name: 'historic_case_detail',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'historic/{reference:[0-9]{7}}/',
      resolve: {
        historicCase: ['$stateParams', 'HistoricCase',
          function ($stateParams, HistoricCase) {
            return HistoricCase.get({reference: $stateParams.reference}).$promise;
          }]
      },
      views: {
        '': {
          templateUrl: 'call_centre/historic_case_detail.html',
          controller: 'HistoricCaseDetailCtrl',
        },
        'personalDetails@historic_case_detail': {
          templateUrl: 'call_centre/historic_case_detail.personal_details.html',
        }
      }
    };

    mod.states = states;
  }]);
})();
