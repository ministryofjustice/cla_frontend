'use strict';
(function() {
// STATES
  var states = angular.module('cla.states'),
      operatorStates = angular.module('cla.states.operator'),
      providerStates = angular.module('cla.states.provider');

  states.getStates = function(APP_BASE_URL) {
    var defs = {};

    defs.Layout = {
      name: 'layout',
      abstract: true,
      templateUrl: 'base.html',
      controller: 'LayoutCtrl',
      resolve: {
        user: ['User', function (User) {
          return User.get({username: 'me'}).$promise;
        }]
      },
      onEnter: ['user', 'postal', function(user, postal) {
        postal.publish({
          channel : 'system',
          topic   : 'user.identified',
          data    : user
        });
      }]
    };

    defs.CaseListState = {
      name: 'case_list',
      parent: 'layout',
      url: APP_BASE_URL+'?person_ref?search?ordering?page?only',
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

    defs.CaseDetailState = {
      parent: 'layout',
      name: 'case_detail',
      abstract: true,
      url: APP_BASE_URL+'{caseref:[A-Z0-9]{2}-[0-9]{4}-[0-9]{4}}/',
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
          return case_.eligibility_check ? EligibilityCheck.get({case_reference: case_.reference}).$promise : new EligibilityCheck({case_reference: case_.reference});
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
          return case_.thirdparty_details ? ThirdParty.get({case_reference: case_.reference}).$promise : new ThirdParty({case_reference: case_.reference});
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

    defs.CaseEditDetailState = {
      parent: 'case_detail',
      name: 'case_detail.edit',
      url: '',
      views: {
        '@case_detail': {
          templateUrl: 'case_detail.edit.html',
          controller: 'CaseEditDetailCtrl'
        }
      }
    };

    defs.CaseEditDetailEligibilityState = {
      parent: 'case_detail.edit',
      name: 'case_detail.edit.eligibility',
      url: 'eligibility/',
      deepStateRedirect: true,
      onEnter: ['eligibility_check', 'diagnosis', 'EligibilityCheckService',
        function(eligibility_check, diagnosis, EligibilityCheckService){
          EligibilityCheckService.onEnter(eligibility_check, diagnosis);
        }],
      views: {
        '@case_detail.edit': {
          templateUrl:'case_detail.edit.eligibility.html',
          controller: 'EligibilityCheckCtrl'
        }
      },
      resolve: {
        // check that the eligibility check can be accessed
        CanAccess: ['$q', 'diagnosis', 'eligibility_check', 'case', function ($q, diagnosis, eligibility_check, $case) {
          var deferred = $q.defer();

          if (!diagnosis.isInScopeTrue() && !eligibility_check.state) {
            deferred.reject({
              msg: 'You must complete an <strong>in scope diagnosis</strong> before completing the financial assessment',
              case: $case.reference,
              goto: 'case_detail.edit.diagnosis'
            });

            // reject promise and handle in $stateChangeError
            deferred.reject({case: $case.reference});
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        }]
      }
    };

    defs.CaseEditDetailEligibilityDetailsState = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.details',
      url: 'details/'
    };
    defs.CaseEditDetailEligibilityFinancesState = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.finances',
      url: 'finances/'
    };
    defs.CaseEditDetailEligibilityIncomeState = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.income',
      url: 'income/'
    };
    defs.CaseEditDetailEligibilityExpensesState = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.expenses',
      url: 'expenses/'
    };

    defs.CaseEditDetailDiagnosisState = {
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

    defs.CaseEditDetailAlternativeHelpState = {
      parent: 'case_detail',
      name: 'case_detail.alternative_help',
      url: 'alternative_help/?keyword?category?page',
      views: {
        '@case_detail': {
          templateUrl:'case_detail.alternative_help.html',
          controller: 'AlternativeHelpCtrl',
        }
      },
      resolve: {
        // check that the case can be given alternative help
        CanAccess: ['$q', 'diagnosis', 'case', 'personal_details', function ($q, diagnosis, $case, personal_details) {
          var deferred = $q.defer();
          var errors = '';

          if (!diagnosis || !diagnosis.category) {
            errors += '<p>Cannot assign alternative help without setting area of law. <strong>Please complete diagnosis</strong>.</p><p>If diagnosis has been completed but you are still getting this message please escalate so missing data can be added to diagnosis engine</p>';
          }

          if (!personal_details.full_name || (!personal_details.postcode && !personal_details.mobile_phone)) {
            errors += '<p>You must collect at least <strong>a name</strong> and <strong>a postcode or phone number</strong> from the client before assigning alternative help.</p>';
          }

          if (errors !== '') {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              modal: true,
              title: 'Missing information',
              msg: errors,
              case: $case.reference,
              goto: 'case_detail.edit.diagnosis'
            });
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        }],
        kb_providers: ['$stateParams', 'KnowledgeBase', function($stateParams, KnowledgeBase){
          var params = {
            search: $stateParams.keyword,
            article_category: $stateParams.category,
            page: $stateParams.page
          };
          return KnowledgeBase.get(params).$promise;
        }],
        kb_categories: ['KnowledgeBaseCategories', function(KnowledgeBaseCategories){
          return KnowledgeBaseCategories.get().$promise;
        }],
        categories: ['Category', function(Category) {
          return Category.query().$promise;
        }]
      }
    };

    defs.UserListState = {
      name: 'user_list',
      parent: 'layout',
      url: APP_BASE_URL+'user/?search',
      templateUrl: 'user_list.html',
      controller: 'UserListCtrl',
      resolve: {
        users: ['User', 'user', '$q', function(User, user, $q){

          var deferred = $q.defer();

          if (!user.is_manager) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'The you must be a manager to edit users.'
            });
            return deferred.promise;
          }
          return User.query().$promise;
        }]
      }
    };

    return defs;
  };


  operatorStates.getStates = function(APP_BASE_URL){
    var operatorStates = states.getStates(APP_BASE_URL);

    operatorStates.CaseListState.templateUrl = 'call_centre/case_list.html';
    operatorStates.CaseListState.resolve.historicCases = ['$stateParams','HistoricCase', function ($stateParams, HistoricCase) {
      var params = {
        search: $stateParams.search,
        page: $stateParams.hpage
      };
      if (!params.search) {
        return [];
      }
      return HistoricCase.query(params).$promise;
    }];

    operatorStates.CaseDetailState.views[''].templateUrl = 'call_centre/case_detail.html';

    operatorStates.CaseEditDetailState.views['@case_detail'].templateUrl = 'call_centre/case_detail.edit.html';

    operatorStates.CaseEditDetailDiversityState = {
      parent: 'case_detail.edit',
      name: 'case_detail.diversity',
      url: 'diversity/',
      views: {
        '@case_detail.edit': {
          templateUrl:'call_centre/case_detail.diversity.html',
          controller: 'DiversityCtrl'
        }
      },
      resolve: {
        // check that the eligibility check can be accessed
        CanAccess: ['$q', 'case', function ($q, $case) {
          var deferred = $q.defer();

          if (!$case.personal_details) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'You must add the client\'s details before completing the diversity questionnaire.',
              case: $case.reference,
              goto: 'case_detail.edit.diagnosis'
            });
          } else {
            deferred.resolve();
          }

          return deferred.promise;
        }],
      }
    };

    operatorStates.CaseEditDetailAssignState = {
      parent: 'case_detail.edit',
      name: 'case_detail.assign',
      url: 'assign/?as_of',
      views: {
        '@case_detail.edit': {
          templateUrl:'call_centre/case_detail.assign.html',
          controller: 'AssignProviderCtrl'
        }
      },
      onEnter: ['AssignProviderValidation', function (AssignProviderValidation) {
        AssignProviderValidation.setWarned(false);
      }],
      resolve: {
        // check that the eligibility check can be accessed
        CanAssign: ['AssignProviderValidation', '$q', 'diagnosis', 'eligibility_check', 'case', 'personal_details', 'History', function (AssignProviderValidation, $q, diagnosis, eligibility_check, $case, personal_details, History) {
          var deferred = $q.defer();
          var valid = AssignProviderValidation.validate({case: $case, personal_details: personal_details});

          if (!diagnosis.isInScopeTrue() || !eligibility_check.isEligibilityTrue()) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'The Case must be <strong>in scope</strong> and <strong>eligible</strong> to be assigned.',
              case: $case.reference,
              goto: 'case_detail.edit.diagnosis'
            });
          } else if (!valid && !AssignProviderValidation.getWarned()) {
            var assign_errors = AssignProviderValidation.getErrors();
            var assign_warnings = AssignProviderValidation.getWarnings();
            var previousState = History.previousState;

            deferred.reject({
              modal: true,
              title: 'Incomplete case',
              errors: assign_errors,
              warnings: assign_warnings,
              case: $case.reference,
              next: 'case_detail.assign',
              goto: previousState.name ? previousState.name : 'case_detail.edit'
            });
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        }],
        MatterTypes: ['MatterType', 'diagnosis', function (MatterType, diagnosis) {
          return MatterType.get({
            category__code: diagnosis.category
          }).$promise;
        }],
        Suggestions: ['case', '$stateParams', '$q', function ($case, $stateParams, $q) {
          var as_of = $stateParams.as_of;
          var deferred = $q.defer();

          $case.get_suggested_providers(as_of).success(function(data) {
            deferred.resolve(data);
          });
          return deferred.promise;
        }]
      }
    };

    operatorStates.CaseDetailDeferAssignmentState = {
      parent: 'case_detail',
      name: 'case_detail.defer_assignment',
      url: 'assign/defer/',
      views: {
        '@case_detail': {
          templateUrl: 'call_centre/case_detail.defer_assignment.html',
          controller: 'CaseDeferSpecialistsCtrl'
        }
      }
    };

    operatorStates.CaseDetailSuspendCase = {
      parent: 'case_detail',
      name: 'case_detail.suspend',
      url: 'suspend/',
      onEnter: ['$stateParams', '$state', '$modal', 'case', 'personal_details', 'History', 'flash', function($stateParams, $state, $modal, $case, personal_details, History, flash) {
        var previousState = History.previousState;
        var suspendOpts = {
          templateUrl: 'case_detail.outcome_modal.html',
          controller: 'OutcomesModalCtl',
          resolve: {
            tplVars: function() {
              return {
                title: 'Suspend case'
              };
            },
            case: function() { return $case; },
            event_key: function() { return 'suspend_case'; }, // this is also the function name on Case model
            notes: function() { return ''; }
          }
        };
        var onSuspendSuccess = function (result) {
          if (result) {
            flash('success', 'Case ' + $case.reference + ' suspended successfully');
          } else {
            flash('error', 'This case could not be suspended');
          }
          $state.go('case_list');
        };
        var onDismiss = function () {
          var state = previousState.name ? previousState.name : 'case_detail.edit';
          $state.go(state, {caseref: $case.reference});
        };
        var confirmOpts = {
          templateUrl: 'call_centre/confirmation_modal.html',
          controller: 'ConfirmationCtrl',
          resolve: {
            tplVars: function () {
              return {
                title: 'Missing client information',
                buttonText: 'Proceed anyway',
                message: 'Please ensure you have made every attempt to collect at least <strong>a name</strong> and <strong>a postcode or phone number</strong> before suspending a case.'
              };
            }
          }
        };
        var onConfirmSuccess = function () {
          $modal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
        };

        // check personal details before suspending
        if (!personal_details.full_name || (!personal_details.postcode && !personal_details.mobile_phone)) {
          $modal.open(confirmOpts).result.then(onConfirmSuccess, onDismiss);
        } else {
          $modal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
        }
      }]
    };

    operatorStates.FeedbackListState = {
      name: 'feedback_list',
      parent: 'layout',
      url: APP_BASE_URL+'feedback/?page?start?end',
      templateUrl: 'call_centre/feedback_list.html',
      controller: 'FeedbackListCtrl',
      resolve: {
        feedback: ['$stateParams', 'Feedback', function($stateParams, Feedback){
          var params = {
            start: $stateParams.start,
            end: $stateParams.end,
            page: $stateParams.page
          };

          return Feedback.query(params).$promise;
        }]
      }
    };

    operatorStates.HistoricCaseListState = {
      name: 'historic_list',
      parent: 'layout',
      url: APP_BASE_URL+'historic/?search?page',
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

    operatorStates.HistoricCaseDetailState = {
      name: 'historic_case_detail',
      parent: 'layout',
      url: APP_BASE_URL+'historic/{reference:[0-9]{7}}/',
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

    return operatorStates;
  };

  providerStates.getStates = function(APP_BASE_URL){
    var providerStates = states.getStates(APP_BASE_URL);

    providerStates.CaseDetailState.views['feedback@case_detail'] = {
      templateUrl: 'provider/case_detail.feedback.html',
      controller: 'FeedbackListCtrl'
    };

    providerStates.CaseDetailState.resolve.feedbackList = ['case', 'Feedback', function(case_, Feedback) {
      return Feedback.query({case: case_.reference}).$promise;
    }];

    providerStates.CaseDetailState.views[''].templateUrl = 'provider/case_detail.html';

    providerStates.CaseListState.templateUrl = 'provider/case_list.html';

    providerStates.CaseEditDetailState.views['@case_detail'].templateUrl = 'provider/case_detail.edit.html';
    return providerStates;
  };

})();

