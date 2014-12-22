(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || {};

    states.CaseDetail = {
      parent: 'layout',
      name: 'case_detail',
      abstract: true,
      url: AppSettings.BASE_URL + '{caseref:[A-Z0-9]{2}-[0-9]{4}-[0-9]{4}}/',
      onEnter: ['modelsEventManager', 'postal', 'case', function(modelsEventManager, postal, case_) {
        modelsEventManager.onEnter();
        postal.publish({
          channel : 'system',
          topic   : 'case.startViewing',
          data    : case_
        });
      }],
      onExit: ['modelsEventManager', 'postal', 'case', function(modelsEventManager, postal, case_) {
        modelsEventManager.onExit();

        postal.publish({
          channel : 'system',
          topic   : 'case.stopViewing',
          data    : case_
        });
      }],
      resolve: {
        'case': ['Case', '$stateParams', '$state', 'flash', function(Case, $stateParams, $state, flash) {
          return Case.get({caseref: $stateParams.caseref}, {},
              function(){},
              function(response){
                if (response.status === 404) {
                  flash('error', 'The Case '+$stateParams.caseref+' could not be found!');
                  $state.go('case_list');
                }
              }
          ).$promise;
        }],
        eligibility_check: ['case', 'EligibilityCheck', function(case_, EligibilityCheck){
          return case_.eligibility_check ? EligibilityCheck.get({case_reference: case_.reference}).$promise : new EligibilityCheck({case_reference: case_.reference, specific_benefits: {}});
        }],
        diagnosis: ['case', 'Diagnosis', function(case_, Diagnosis){
          return case_.diagnosis ? Diagnosis.get({case_reference: case_.reference}).$promise : new Diagnosis({case_reference: case_.reference});
        }],
        personal_details: ['case', 'PersonalDetails', function(case_, PersonalDetails) {
          return case_.personal_details ? PersonalDetails.get({case_reference: case_.reference}).$promise : new PersonalDetails({case_reference: case_.reference});
        }],
        adaptation_details: ['case', 'Adaptations', function(case_, Adaptations) {
          return case_.adaptation_details ? Adaptations.get({case_reference: case_.reference}).$promise : new Adaptations({case_reference: case_.reference});
        }],
        adaptations_metadata: ['AdaptationsMetadata', function(AdaptationsMetadata) {
          return AdaptationsMetadata.options().$promise;
        }],
        thirdparty_details: ['case', 'ThirdParty', function(case_, ThirdParty) {
          return case_.thirdparty_details ? ThirdParty.get({case_reference: case_.reference}).$promise : new ThirdParty({case_reference: case_.reference, personal_details: {}});
        }],
        mediacodes: ['MediaCode', function(MediaCode) {
          return MediaCode.get().$promise;
        }],
        log_set: function() {
          return {
            data: []
          };
        },
        modelsEventManager: ['case', 'eligibility_check', 'diagnosis', 'log_set', 'ModelsEventManager', function(case_, eligibility_check, diagnosis, log_set, ModelsEventManager) {
          return new ModelsEventManager(case_, eligibility_check, diagnosis, log_set);
        }],
      },
      views: {
        '': {
          templateUrl: 'case_detail.html',
          controller: 'CaseDetailCtrl'
        },
        'outcome@case_detail': {
          templateUrl: 'case_detail.outcome.html'
        },
        'personalDetails@case_detail': {
          templateUrl: 'case_detail.personal_details.html',
          controller: 'PersonalDetailsCtrl'
        }
      }
    };

    mod.states = states;
  }]);
})();
