(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || {};

    states.CaseList = {
      name: 'case_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + '?person_ref?search?ordering?page?only',
      templateUrl: 'case_list.html',
      controller: 'CaseListCtrl',
      onEnter: ['$state', '$stateParams', 'postal', '$interval', 'cases', 'AppSettings', function($state, $stateParams, postal, $interval, cases, AppSettings) {
        if (AppSettings.caseListRefreshDelay > 0) {
          var self = this,
              refreshCases = function(___, force) {
                // only refresh if force === true or the page is active
                if (force || !document.hidden) {
                  cases.$query(self.getCaseQueryParams($stateParams));
                }
              };

          this.refreshCastListInterval = $interval(refreshCases, AppSettings.caseListRefreshDelay);
        }
      }],
      onExit: ['$interval', function($interval) {
        $interval.cancel(this.refreshCastListInterval);
      }],
      getCaseQueryParams: function($stateParams) {
          var params = {
            person_ref: $stateParams.person_ref,
            search: $stateParams.search,
            ordering: $stateParams.ordering,
            page: $stateParams.page,
            only: $stateParams.only
          };

          // by default, if no search params is defined, get dashboard cases
          // this can be easily customised by backend
          if (!params.search) {
            params.dashboard = 1;
          }

          return params;
      },
      resolve: {
        cases: ['$stateParams', 'Case', function($stateParams, Case){
          return Case.query(this.getCaseQueryParams($stateParams)).$promise;
        }],
        historicCases: function () {
          return [];
        },
        person: ['cases', '$stateParams', function(cases, $stateParams) {
          var person_ref = $stateParams.person_ref,
              personal_details;

          if (!person_ref || !cases.results.length) {
            personal_details = {};
          } else {
            var case_ = cases.results[0];
            personal_details = {
              reference: case_.personal_details,
              full_name: case_.full_name,
              postcode: case_.postcode
            };
          }

          return personal_details;
        }]
      }
    };

    mod.states = states;
  }]);
})();
