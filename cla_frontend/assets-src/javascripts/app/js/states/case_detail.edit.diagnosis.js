(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditDiagnosis = {
      parent: 'case_detail.edit',
      name: 'case_detail.edit.diagnosis',
      url: 'diagnosis/',
      views: {
        '@case_detail.edit': {
          templateUrl:'case_detail.edit.diagnosis.html',
          controller: 'DiagnosisCtrl'
        }
      }
    };

    mod.states = states;
  });
})();
