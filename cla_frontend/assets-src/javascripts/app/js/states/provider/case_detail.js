(function () {
  'use strict';

  var mod = angular.module('cla.states.provider');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetail.views[''].templateUrl = 'provider/case_detail.html';
    states.CaseDetail.views['feedback@case_detail'] = {
      templateUrl: 'provider/case_detail.feedback.html',
      controller: 'FeedbackListCtrl'
    };
    states.CaseDetail.resolve.feedbackList = ['case', 'Feedback', function(case_, Feedback) {
      return Feedback.query({case: case_.reference}).$promise;
    }];

    mod.states = states;
  });
})();
