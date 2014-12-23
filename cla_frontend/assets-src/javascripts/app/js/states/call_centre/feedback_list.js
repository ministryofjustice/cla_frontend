(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.FeedbackList = {
      name: 'feedback_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'feedback/?page?start?end?hide_resolved',
      templateUrl: 'call_centre/feedback_list.html',
      controller: 'FeedbackListCtrl',
      resolve: {
        feedback: ['$stateParams', 'Feedback', function($stateParams, Feedback){
          var params = {
            start: $stateParams.start,
            end: $stateParams.end,
            page: $stateParams.page
          };

          if ($stateParams.hide_resolved === 'True') {
            params.resolved = 'False';
          }

          return Feedback.query(params).$promise;
        }]
      }
    };

    mod.states = states;
  }]);
})();
