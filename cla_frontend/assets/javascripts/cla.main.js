'use strict';
(function(){
  angular.module('cla.controllers',[]);
  angular.module('cla.services',['ngResource']);
  angular.module('cla.services.operator', ['ngResource', 'cla.services']);
  angular.module('cla.services.provider', ['ngResource', 'cla.services']);
  angular.module('cla.filters',[]);
  angular.module('cla.directives',[]);
  angular.module('cla.states',[]);
  angular.module('cla.utils',[]);
  angular.module('cla.templates',[]);
  angular.module('cla.routes', ['cla.states']);

  var common_run;
  var common_config;

  common_run = ['$rootScope', '$state', '$stateParams', 'Timer', 'flash', 'cla.bus', 'History', '$uibModal', 'AssignProviderValidation', 'postal',
    function ($rootScope, $state, $stateParams, Timer, flash, bus, History, $uibModal, AssignProviderValidation, postal) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      // handle state change errors
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
        // generic state change error / redirect
        if (error.msg && !error.modal) {
          flash('error', error.msg);
        }
        // if content should appear in modal
        if (error.modal) {
          var opts = {
            templateUrl: 'invalid_modal.html',
            controller: 'InvalidCtrl',
            resolve: {
              tplVars: function () {
                return {
                  title: error.title,
                  message: error.msg,
                  errors: error.errors,
                  warnings: error.warnings
                };
              }
            }
          };
          var onConfirmSuccess = function (result) {
            if (result) {
              AssignProviderValidation.setWarned(true);
              $state.go(error.next, {caseref: error.case});
            } else {
              $state.go(error.goto, {caseref: error.case});
            }
          };
          var onDismiss = function () {
            $state.go(error.goto, {caseref: error.case});
          };

          $uibModal.open(opts).result.then(onConfirmSuccess, onDismiss);
        } else if (error.goto) {
          $state.go(error.goto, {caseref: error.case});
        }
      });
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        // log the previous state in the History
        History.previousState = fromState;
        History.previousState.params = fromParams;
      });

      Timer.install();
      bus.install();

      // set Piwik user id as logged in username
      postal.subscribe({
        channel: 'system',
        topic: 'user.identified',
        callback: function (user) {
          try {
            ga('set', '&uid', user.username);
          } catch (err) {
            console.warn('Google analytics is not installed', err);
          }
        }
      });
    }];

  common_config = ['$resourceProvider', 'cfpLoadingBarProvider',
    function($resourceProvider, cfpLoadingBarProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
    cfpLoadingBarProvider.includeBar = false;
  }];


  //
  // Operator App
  //
  angular.module('cla.states.operator',['cla.states']);
  angular.module('cla.controllers.operator',[]);
  angular.module('cla.settings.operator', []).constant('AppSettings', {
    BASE_URL: '/call_centre/',
    timerEnabled: function() {
      return true;
    },
    callScriptEnabled: true,
    callMeBackEnabled: true,
    caseListRefreshDelay: 150000,  // in ms. -1 to disable it
    statesModule: 'cla.states.operator',
    appName: 'operator',
    tabWarningEnabled: false
  });

  angular.module('cla.operatorApp',
    [
      'cla.settings.operator',
      'cla.states.operator',
      'ngSanitize',
      'ngMessages',
      'angularMoment',
      'angular-blocks',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.controllers.operator',
      'cla.services',
      'cla.services.operator',
      'cla.filters',
      'cla.directives',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'hl.sticky',
      'angular-loading-bar',
      'angulartics',
      'angulartics.google.analytics',
      'cfp.hotkeys',
      'LocalStorageModule',
      'diff-match-patch',
      'angularUtils.directives.dirPagination',
      'ngTextTruncate',
      'ngIdle'
    ])
    .config(common_config)
    .run(common_run);


  //
  // Provider App
  //
  angular.module('cla.states.provider',['cla.states']);
  angular.module('cla.controllers.provider',[]);
  angular.module('cla.settings.provider', []).constant('AppSettings', {
    BASE_URL: '/provider/',
    timerEnabled: function() {
      return false;
    },
    callScriptEnabled: false,
    callMeBackEnabled: true,
    caseListRefreshDelay: 150000,  // in ms. -1 to disable it
    statesModule: 'cla.states.provider',
    appName: 'provider',
    tabWarningEnabled: false
  });

  angular.module('cla.providerApp',
    [
      'cla.settings.provider',
      'cla.states.provider',
      'ngSanitize',
      'ngMessages',
      'angularMoment',
      'angular-blocks',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.controllers.provider',
      'cla.services',
      'cla.services.provider',
      'cla.filters',
      'cla.directives',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'hl.sticky',
      'angular-loading-bar',
      'angulartics',
      'angulartics.google.analytics',
      'cfp.hotkeys',
      'LocalStorageModule',
      'diff-match-patch',
      'angularUtils.directives.dirPagination',
      'ngTextTruncate',
      'ngIdle'
    ])
    .config(common_config)
    .run(common_run);
})();

angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('404.html',
        "<header class=\"PageHeader\">\n  <h1>Page could not be found</h1>\n</header>\n\n<p>The page you have tried to access could not be found. Please double check the URL or go back to the <a ui-sref=\"case_list\">case list</a> page.</p>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('alternative_help_survey.modal.html',
        "<header>\n  <h2>Survey reminder</h2>\n</header>\n\n<call-script>\n  <p>If you require any further assistance please do not hesitate to call us back.  We are open from 9am - 8pm Monday to Friday and 9am - 12.30pm on Saturdays.</p>\n  <p>Just before you go today the line will go silent as I transfer you to a short automated survey which will ask you a few questions about the service you receive today.</p>\n  <p>Thank you for calling Civil Legal Advice. Goodbye.</p>\n</call-script>\n\n<div class=\"FormActions\">\n  <button type=\"submit\" class=\"Button\" ng-click=\"continue()\">Continue</button>\n  <button type=\"button\" class=\"Button Button--text\" ng-click=\"cancel()\">Cancel</button>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('base.html',
        "<div ui-view></div>");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.alternative_help.ecf.html',
        "<header>\n  <h2>Exceptional case funding</h2>\n</header>\n\n<call-script>\n  <p>Is there anything else we can assist you with today?</p>\n  <p>If you require any further assistance please do not hesitate to call us back. We are open from 9am-8pm Monday to Friday and 9am-12:30pm on Saturdays.</p>\n</call-script>\n\n<p>Please indicate how you notified the client of the exceptional case funding.</p>\n\n<form method=\"post\" ng-submit=\"save()\">\n  <div class=\"FormBlock FormBlock--yellow\">\n    <div class=\"FormRow FormRow--group FormRow--groupNarrow\" ng-repeat=\"statement in ecf_statements\">\n      <label class=\"FormRow-label\">\n        <input type=\"radio\" value=\"{{ ::statement.key }}\" ng-model=\"::case.ecf_statement\" name=\"ecf_statement\" required>\n        <span class=\"FormRow-labelText\">\n          {{ ::statement.label }}\n          <span class=\"u-mute u-block\" ng-if=\"statement.text\">{{ ::statement.text }}</span>\n        </span>\n      </label>\n    </div>\n  </div>\n\n  <div class=\"FormActions\">\n    <button type=\"submit\" class=\"Button\" type=\"submit\">Save</button>\n    <button type=\"button\" class=\"Button Button--text\" ng-click=\"cancel()\">Cancel</button>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.alternative_help.html',
        "<header class=\"PageHeader cf\">\n  <h1 class=\"u-pullLeft\">Alternative help</h1>\n</header>\n\n<ng-include src=\"includePath + 'includes/case_notes.html'\"></ng-include>\n\n<ul class=\"Tabs\"><!--\n  --><li class=\"Tabs-tab is-active\">\n    <a href=\"\" class=\"Tabs-tabLink\">Knowledge base</a>\n  </li><!--\n  --><li class=\"Tabs-tab\">\n    <a href=\"{{getF2fDeepLink()}}\" target=\"_blank\" class=\"Tabs-tabLink\" ng-click=\"f2f_clicked=true\">Face to Face</a>\n  </li><!--\n--></ul>\n\n<!-- no providers -->\n<div class=\"Error Error--basic\" ng-if=\"providers.count < 1\">\n  <p>There are <strong>no providers available</strong> matching your criteria. Please contact a supervisor.</p>\n</div>\n\n<call-script ng-if=\"diagnosis.isInScopeTrue() && eligibility_check.isEligibilityFalse()\">\n  <p>Based on the information you have provided the assessment shows that you do not qualify for Legal Aid.  However we can provide alternative contact details of organisations who may be able to assist you.</p>\n  <p>We can provide helplines, websites or F2F however please be aware that you may have to pay for that service. Do you have any preference on the alternative help we provide today?</p>\n  <p>[Discussion on best options, paid v free, website calls, national services, local services, read from websites etc. Give details of organisations. Remember to record details of the conversation in your CHS notes.]</p>\n</call-script>\n\n<details class=\"SelectedProviders\">\n  <summary>Selected organisations ({{ alternativeHelpService.selected_providers_length() }})</summary>\n  <div class=\"SummaryBlock SummaryBlock--compact\">\n    <div class=\"SummaryBlock-content\" ng-repeat=\"provider in alternativeHelpService.selected_providers\">\n      <strong>\n        {{ ::provider.service_name }}\n        <span ng-if=\"provider.organisation\"> - {{ ::provider.organisation }}</span>\n      </strong>\n      <p ng-if=\"provider.website\"><a href=\"{{ ::provider.website }}\" target=\"_blank\">{{ ::provider.website }}</a></p>\n      <p ng-if=\"provider.description\">{{ ::provider.description }}</p>\n      <p ng-if=\"provider.how_to_use\"><strong>How to use:</strong> {{ ::provider.how_to_use }}</p>\n      <p ng-if=\"provider.when_to_use\"><strong>When to use:</strong> {{ ::provider.when_to_use }}</p>\n      <div class=\"Grid\">\n        <div class=\"Grid-row cf\">\n          <div class=\"Grid-col Grid-col--1-3\">{{ ::provider.address }}</div>\n          <div class=\"Grid-col Grid-col--1-3\" ng-if=\"::provider.telephone_numbers\">\n            <span ng-repeat=\"telephone_number in provider.telephone_numbers\">\n              <span ng-if=\"::telephone_number.name\">({{ ::telephone_number.name}}) </span>{{ ::telephone_number.number}}<br>\n            </span>\n          </div>\n          <div class=\"Grid-col Grid-col--1-3\">{{ ::provider.opening_hours }}</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</details>\n\n<form class=\"FormRow cf\" ng-submit=\"searchProviders(keyword)\">\n  <select ui-select2=\"{allowClear: true}\" name=\"category\" class=\"FormRow-field--inline FormRow-field--m\" data-placeholder=\"Law category\" ng-options=\"s.id as s.name for s in categories track by s.id\" ng-model=\"::selected_category\" ng-change=\"changeCategory(selected_category)\">\n    <option value=\"\"></option>\n  </select>\n\n  <input type=\"text\" autocomplete=\"off\" name=\"keyword\" placeholder=\"Search providers and other help organisations\" class=\"FormRow-field--l\" ng-model=\"::keyword\">\n  <input class=\"Search-submit\" type=\"submit\" value=\"Search\">\n</form>\n\n<form class=\"FormRow cf\" name=\"alternative_help\">\n  <p class=\"Error Error--basic\" ng-if=\"valid === false\">Please choose <strong>three providers</strong>.</p>\n\n  <div class=\"FormRow FormRow--group\" dir-paginate=\"provider in providers.results | itemsPerPage: 20\" total-items=\"providers.count\" current-page=\"currentPage\">\n    <label class=\"FormRow-label FormRow-label--odd\">\n      <input\n        name=\"selected_providers\"\n        type=\"checkbox\"\n        value=\"{{ ::provider.id }}\"\n        ng-model=\"::alternativeHelpService.selected_ids[provider.id]\"\n        ng-change=\"toggleProvider(provider)\">\n      <strong>\n        {{ ::provider.service_name }}\n        <span ng-if=\"provider.organisation\"> - {{ ::provider.organisation }}</span>\n      </strong>\n      <span class=\"FormRow-inner\">\n        <span class=\"u-block FormRow\" ng-if=\"provider.website\"><a href=\"{{ ::provider.website }}\" target=\"_blank\">{{ ::provider.website }}</a></span>\n        <span class=\"u-block FormRow\" ng-if=\"provider.description\">{{ ::provider.description }}</span>\n        <span class=\"u-block FormRow\" ng-if=\"provider.how_to_use\"><strong>How to use:</strong> {{ ::provider.how_to_use }}</span>\n        <span class=\"u-block FormRow\" ng-if=\"provider.when_to_use\"><strong>When to use:</strong> {{ ::provider.when_to_use }}</span>\n        <span class=\"Grid\">\n          <span class=\"Grid-row cf\">\n            <span class=\"Grid-col Grid-col--1-3\">{{ ::provider.address }}</span>\n            <span class=\"Grid-col Grid-col--1-3\" ng-if=\"::provider.telephone_numbers\">\n              <span ng-repeat=\"telephone_number in provider.telephone_numbers\">\n                <span ng-if=\"::telephone_number.name\">({{ ::telephone_number.name}}) </span>{{ ::telephone_number.number}}<br>\n              </span>\n            </span>\n            <span class=\"Grid-col Grid-col--1-3\">{{ ::provider.opening_hours }}</span>\n          </span>\n        </span>\n      </span>\n    </label>\n  </div>\n\n  <div class=\"FormRow cf\">\n    <label for=\"notes\" class=\"visuallyhidden\">Reassignment notes</label>\n    <textarea name=\"assign-notes\" id=\"notes\" cols=\"30\" rows=\"4\" ng-model=\"::alternativeHelpService.notes\" placeholder=\"Assignment comments\"></textarea>\n  </div>\n\n  <dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n\n  <div class=\"FormActions\">\n    <button type=\"submit\" class=\"Button\" name=\"assign-alternative-help\" ng-disabled=\"alternativeHelpService.get_selected_provider_ids()==0\" ng-click=\"submit()\">Assign alternative help</button>\n    <button type=\"submit\" class=\"Button\" name=\"assign-f2f\" ng-if=\"f2f_clicked\" ng-disabled=\"alternativeHelpService.notes.length==0\" ng-click=\"submit('COSPF')\">Assign F2F help</button>\n    <button type=\"button\" class=\"Button Button--secondary\" name=\"btn-decline-help\" ng-controller=\"CaseDetailDeclineHelpCtrl\" ng-click=\"decline_help(alternativeHelpService.notes)\">User declines all help / no appropriate help found</button>\n    <a ui-sref=\"case_detail.edit.diagnosis\">Cancel</a>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.edit.diagnosis.html',
        "<form ng-submit=\"moveDown()\" novalidate name=\"diagnosis-form\">\n  <div class=\"FormRow FormRow--group FormRow--groupNarrow FormRow--details\" ng-if=\"diagnosis.version_in_conflict\">\n    <p>It looks like this scope diagnosis has not been completed. Please delete it and create a new one if necessary.\n    <br>You can access any previous versions from the siderbar on the right.</p>\n  </div>\n\n  <section class=\"SummaryBlock SummaryBlock--compact\" ng-if=\"diagnosis.nodes\">\n    <div class=\"SummaryBlock-content\" ng-repeat=\"statement in diagnosis.nodes\" ng-bind-html=\"::statement.label\"></div>\n    <div class=\"SummaryBlock-content\" ng-if=\"category\">\n      <p><strong>Category of law</strong>: {{ ::category.name }}</p>\n    </div>\n  </section>\n\n  <p ng-if=\"!!diagnosis.nodes[diagnosis.nodes.length-1].heading\">\n    <strong>{{ diagnosis.nodes[diagnosis.nodes.length-1].heading }}</strong>\n  </p>\n\n  <div class=\"FormRow FormRow--group FormRow--groupNarrow FormRow--details\" ng-repeat=\"choice in diagnosis.choices\" ng-if=\"diagnosis.isInScopeUnknown()\">\n    <label class=\"FormRow-label\">\n      <input type=\"radio\" value=\"{{ ::choice.id }}\" name=\"choice\" ng-model=\"::diagnosis.current_node_id\" required>\n      <div class=\"FormRow-labelText FormRow-labelText--basic\">\n        <span ng-bind-html=\"::choice.label\"></span>\n      </div>\n    </label>\n    <details ng-if=\"choice.help_text\">\n      <summary>Help</summary>\n      <div ng-bind-html=\"::choice.help_text\"></div>\n    </details>\n  </div>\n\n  <div class=\"FormActions\">\n    <button type=\"submit\" name=\"diagnosis-new\" class=\"Button\" ng-click=\"createDiagnosis()\" ng-if=\"!diagnosis.reference\">Create scope diagnosis</button>\n\n    <button type=\"submit\" name=\"diagnosis-next\" class=\"Button\" ng-if=\"!diagnosis.version_in_conflict && diagnosis.isInScopeUnknown() && diagnosis.reference\">Next</button>\n    <button type=\"button\" name=\"diagnosis-back\" class=\"Button Button--text\" ng-if=\"!diagnosis.version_in_conflict && diagnosis.nodes && diagnosis.isInScopeUnknown()\" ng-click=\"moveUp()\">Back</button>\n\n    <a ui-sref=\"case_detail.edit.eligibility\" class=\"Button\" ng-if=\"diagnosis.isInScopeTrue()\">Create financial assessment</a>\n    <button type=\"button\" name=\"diagnosis-delete\" class=\"Button Button--secondary\" ng-really-message=\"Are you sure you want to delete the diagnosis?\" ng-really-click=\"delete()\" ng-if=\"diagnosis.version_in_conflict || diagnosis.isInScopeTrue() || diagnosis.isInScopeFalse()\">Delete scope diagnosis</button>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.edit.eligibility.html',
        "<form ng-submit=\"save()\" novalidate name=\"form\" class=\"Form-eligibility u-relative\" form-changed>\n  <div class=\"Toolbar clearfix\">\n    <ul class=\"Pills u-pullLeft\">\n      <li class=\"Pills-pill {{ tabWarningClass(section) }}\" ng-repeat=\"section in sections\"\n          ng-class=\"{'is-active': currentState() === section.state}\">\n        <a href=\"\" ng-click=\"gotoSection(section)\" class=\"Pills-pillLink\">{{ ::section.title }}</a>\n      </li>\n    </ul>\n    <div class=\"Actions u-pullRight\">\n      <button type=\"submit\" class=\"Button\" name=\"save-means-test\">Save assessment</button>\n      <button class=\"Button--secondary\" ng-click=\"skipMeansTest()\" type=\"button\">Skip</button>\n    </div>\n  </div>\n\n  <div class=\"Notice warning\" ng-if=\"hasIncomeWarnings()\">\n    <p>The system is showing me that:</p>\n\n    <ul>\n      <li ng-if=\"incomeWarnings.zeroIncome\">you<span ng-show=\"hasPartner()\"> and your partner</span> currently have no income;</li>\n      <li ng-if=\"incomeWarnings.negativeDisposable\">you<span ng-show=\"hasPartner()\"> and your partner</span> currently have negative disposable income;</li>\n      <li ng-if=\"incomeWarnings.housing\">your housing costs exceed one third of your income;</li>\n    </ul>\n\n    <p>For our records I just need to know whether you<span ng-show=\"hasPartner()\"> and your partner</span></p>\n\n    <ol class=\"u-alphaList\">\n      <li>have had any financial help within the last month?</li>\n      <li>have any debts you would like advice about?</li>\n      <li>how you have been coping financially over the last calendar month?</li>\n    </ol>\n  </div>\n\n  <div ng-repeat=\"section in sections\" ng-include=\"section.template\" ng-show=\"currentState() === section.state\"></div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.edit.html',
        "<header class=\"PageHeader cf\">\n  <h1>{{ ::pageTitle || 'Case details' }}</h1>\n</header>\n\n<ng-include src=\"includePath + 'includes/case_notes.html'\"></ng-include>\n\n<p class=\"s-entitlementNum\" ng-if=\"case.isInScopeAndEligible() || (appName === 'provider' && case.laa_reference)\">Entitlement: {{ ::case.laa_reference }}</p>\n\n<ul class=\"Tabs\"><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('case_detail.edit.diagnosis')}\">\n    <a ui-sref=\"case_detail.edit.diagnosis\" class=\"Tabs-tabLink\" ng-class=\"diagnosisIcon()\">Scope</a>\n  </li><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('case_detail.edit.eligibility'), 'is-disabled': !diagnosis.isInScopeTrue() && !eligibility_check.state}\">\n    <a ui-sref=\"case_detail.edit.eligibility\" class=\"Tabs-tabLink\" ng-class=\"eligibilityIcon()\">Finances</a>\n  </li><!--\n  --><li data-block=\"extra-tabs\"></li><!--\n--></ul>\n\n<div ui-view=\"\"></div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.html',
        "<header class=\"CaseBar Grid\" hl-sticky=\"\" use-placeholder data-block=\"case-header\">\n  <div class=\"Grid-row\">\n    <div class=\"Grid-col Grid-col--1-5\">\n      <h1 class=\"CaseBar-caseNum Icon Icon--folder\">\n        <a ui-sref=\"case_detail.edit.diagnosis\">\n          {{ ::case.reference }}\n        </a>\n      </h1>\n    </div>\n    <div class=\"Grid-col Grid-col--4-5\">\n      <p class=\"Icon Icon--alert Icon--orange u-pullLeft\" ng-if=\"peopleViewingCase.length > 0\"><strong>{{ peopleViewingCase|join }}</strong> {{ peopleViewingCase.length === 1 ? 'is' : 'are' }} also currently viewing this case</p>\n      <span data-block=\"case-actions\"></span>\n      <timer base-time=\"case.billable_time\"></timer>\n    </div>\n  </div>\n</header>\n\n<div class=\"Grid\">\n  <div class=\"Grid-row\">\n    <div class=\"Grid-col Grid-col--1-5\">\n      <nav class=\"SubNav\">\n        <a ui-sref=\"case_list(caseListStateParams)\" class=\"SubNav-link SubNav-link--back\">Back to cases</a>\n      </nav>\n      <div ui-view=\"personalDetails\"></div>\n      <div data-block=\"case-eod_details\"></div>\n    </div>\n\n    <div class=\"Grid-col Grid-col--3-5\" ui-view full-height data-centre-col></div>\n\n    <div class=\"Grid-col Grid-col--1-5 Grid-col--bg-colour Guidance-buffer\">\n      <div class=\"Grid-colInner\" data-block=\"rh-col\">\n        <div ui-view=\"outcome\"></div>\n        <div ui-view=\"feedback\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.outcome.html',
        "<ul class=\"CaseHistory\" ng-controller=\"LogListCtrl\">\n  <li class=\"CaseHistory-card\" ng-repeat=\"logList in logSet\">\n    <span>\n      <timestamp ng-model=\"logList[0].created\"></timestamp>\n      ({{ ::logList[0].created_by }})\n    </span>\n\n    <ul class=\"CaseHistory-log\">\n      <li class=\"CaseHistory-logItem cf\" ng-repeat=\"log in logList\">\n        <span class=\"CaseHistory-label\" ng-if=\"log.type == 'outcome'\">{{ ::log.code }}</span>\n\n        <details ng-if=\"log.code === 'MT_CHANGED' || log.code === 'MT_CREATED'\">\n          <summary role=\"button\">Means test {{ ::log.code === 'MT_CREATED' ? 'created' : 'changed' }}</summary>\n          <span class=\"CaseHistory-logItemNotes CaseHistory-logItemNotes--indent\">{{ ::log.notes }}</span>\n        </details>\n\n        <div ng-if=\"log.code === 'DIAGNOSIS_DELETED'\">\n          <a href=\"\" ng-click=\"showDiagnosisSummary(log)\">Diagnosis deleted</a>\n        </div>\n\n        <div ng-if=\"log.code === 'INCOMPLETE_DIAGNOSIS_DELETED'\">\n          <a href=\"\" ng-click=\"showDiagnosisSummary(log)\">Incomplete Diagnosis deleted</a>\n        </div>\n\n        <div ng-if=\"log.code === 'DIAGNOSIS_CREATED'\">\n          <a href=\"\" ng-click=\"showDiagnosisSummary(log)\">Diagnosis created</a>\n        </div>\n\n        <div ng-if=\"log.code === 'CALLBACK_COMPLETE'\">\n          <span class=\"CaseHistory-logItemNotes\">Callback stopped</span>\n        </div>\n\n        <span\n          class=\"CaseHistory-logItemNotes\"\n          ng-if=\"log.notes && log.code !== 'MT_CREATED' && log.code !== 'MT_CHANGED'\"\n          ng-text-truncate=\"log.notes\"\n          ng-tt-words-threshold=\"10\"\n          ng-tt-more-label=\"Show more\"\n          ng-tt-less-label=\"Show less\"></span>\n      </li>\n    </ul>\n  </li>\n</ul>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.outcome_modal.html',
        "<header>\n  <h2>{{ ::tplVars.title }}</h2>\n</header>\n\n\n<form method=\"post\" novalidate ng-submit=\"submit(reject_frm.$valid)\" name=\"reject_frm\">\n  <p class=\"Error-message\" ng-if=\"errors.__all__\">{{ errors.__all__ }}</p>\n\n  <div class=\"FormBlock FormBlock--yellow\">\n    <div class=\"FormRow cf\" ng-show=\"outcome_codes\">\n      <input type=\"text\" name=\"outcome-modal-code-search\" placeholder=\"Search codes\" class=\"FormRow-field--l\" ng-model=\"::code_search\" search-filter>\n    </div>\n\n    <fieldset class=\"FormRow\" ng-show=\"outcome_codes\">\n      <span class=\"Error-message\" ng-show=\"reject_frm.code.$error.required && submitted\">An outcome code is required</span>\n      <span class=\"Error-message\" ng-show=\"errors.event_code\">{{ errors.event_code }}</span>\n      <div class=\"FormRow FormRow--group FormRow--groupNarrow\" ng-repeat=\"code in outcome_codes | filter:code_search\">\n        <label class=\"FormRow-label\">\n          <input type=\"radio\" value=\"{{ ::code.code }}\" ng-model=\"selected.outcome_code\" name=\"code\" ng-required=\"true\" server-error>\n          {{ ::code.code }} <span class=\"u-mute\">- {{ ::code.description }}</span>\n          <p ng-if=\"code.code == 'IRCB'\" ng-switch=\"ircb_escalates\" class=\"Notice Notice--secondary\" style=\"margin:0 0 0 35px\">\n            <span ng-switch-when=\"escalated\">Complaint already escalated</span>\n            <span ng-switch-when=\"will_escalate\">EOD will be escalated to complaint</span>\n            <span ng-switch-default>EOD is not set, will not escalate to complaint</span>\n          </p>\n        </label>\n      </div>\n    </fieldset>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"Error-message\">\n          <span ng-show=\"reject_frm.outcomeNotes.$error.required\">Notes are required</span>\n          <span ng-show=\"errors.notes\">{{ errors.notes }}</span>\n          <span ng-show=\"errors.comment\">{{ errors.comment }}</span>\n        </span>\n        <textarea class=\"FormRow-field--full\" cols=\"20\" rows=\"6\" name=\"outcomeNotes\" ng-model=\"selected.notes\" placeholder=\"Notes\" server-error></textarea>\n      </label>\n    </div>\n\n    <outcome-feedback ng-if=\"feedback_allowed\" outcome-code=\"selected.outcome_code\" issue=\"selected.issue\" form=\"reject_frm\" submitted=\"submitted\"></outcome-feedback>\n  </div>\n\n  <div class=\"FormActions\" data-block=\"formActions\">\n    <button class=\"Button\" type=\"submit\" ng-click=\"submitted=true\">{{ ::tplVars.buttonText }}</button>\n    <a href=\"\" ng-click=\"cancel()\">Cancel</a>\n  </div>\n</form>\n\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.personal_details.html',
        "<div ng-include=\"'includes/personal_details.html'\"></div>\n<div ng-include=\"'includes/third_party.html'\"></div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_detail.spor.html',
        "<header>\n  <h2>Assign Ineligible Case?</h2>\n</header>\n\n<form method=\"post\" ng-submit=\"submit()\">\n  <div class=\"FormBlock FormBlock--yellow\">\n  <div class=\"FormActions\">\n    <button class=\"Button\" type=\"submit\">Assign case</button>\n    <a href=\"\" ng-click=\"cancel()\">Cancel</a>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('case_list.html',
        "<header class=\"PageHeader cf\">\n  <div ng-switch on=\"user.is_manager\">\n    <div ng-switch-when=\"true\">\n      <h1 data-block=\"title\">Cases</h1>\n    </div>\n    <h1 ng-switch-default>Cases</h1>\n  </div>\n\n  <div data-block=\"top-actions\"></div>\n\n  <nav class=\"Filters\">\n    <a class=\"Label is-selected is-removable\" ng-if=\"searchParams.search\" ng-click=\"resetSearch()\">\"{{ searchParams.search }}\"</a>\n    <span data-block=\"filters\"></span>\n  </nav>\n\n  <div data-block=\"page-nav\"></div>\n</header>\n\n<div ui-view=\"list-content\">\n  <table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" ng-show=\"cases.results.length > 0\">\n    <thead>\n      <tr>\n        <th width=\"2%\"></th>\n        <th width=\"16%\">Reference number</th>\n        <th width=\"16%\"><a href=\"\" ng-click=\"sortToggle('personal_details__full_name')\" ng-class=\"sortClass('personal_details__full_name')\">Name</a></th>\n        <th width=\"10%\"><a href=\"\" ng-click=\"sortToggle('personal_details__postcode')\" ng-class=\"sortClass('personal_details__postcode')\">Postcode</a></th>\n        <th width=\"10%\"><a href=\"\" ng-click=\"sortToggle('personal_details__date_of_birth')\" ng-class=\"sortClass('personal_details__date_of_birth')\">Date of Birth</a></th>\n        <th width=\"18%\"><a href=\"\" ng-click=\"sortToggle('eligibility_check__category__name')\" ng-class=\"sortClass('eligibility_check__category__name')\">Area of Law</a></th>\n        <th width=\"10%\"><a href=\"\" ng-click=\"sortToggle('modified')\" ng-class=\"sortClass('modified')\">Modified</a></th>\n        <th width=\"8%\"><span data-block=\"outcome-column\"><a href=\"\" ng-click=\"sortToggle('priority')\" ng-class=\"sortClass('priority')\">Priority</a></span></th>\n        <th width=4%\"></th>\n        <th width=\"6%\" ng-if=\"::user.is_manager\"><a href=\"\" ng-click=\"sortToggle('flagged_with_eod')\" ng-class=\"sortClass('flagged_with_eod')\" title=\"Expressions of Dissatisfaction\">EOD</a></th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr dir-paginate=\"case in cases.results | itemsPerPage: 20\"\n        total-items=\"cases.count\" current-page=\"searchParams.page\"\n        ng-class=\"::rowClass(case)\"\n        callback-sla=\"{{ case.requires_action_at }}\"\n        case-source=\"{{ ::case.source }}\">\n        <td>\n          <abbr title=\"{{ ::case.source }} CASE\" class=\"Icon {{ ::opCaseClass(case) }}\" ng-if=\"::opCaseClass(case)\"></abbr>\n          <abbr title=\"Case status\" class=\"Icon {{ ::provCaseClass(case) }}\" ng-if=\"::provCaseClass(case)\"></abbr>\n        </td>\n        <td>\n          <a href=\"\" ng-click=\"goToCase(case.reference)\">{{ ::case.reference }}</a>\n          <span ng-if=\"case.isInScopeAndEligible()\"> / {{ ::case.laa_reference }}</span>\n        </td>\n        <td>\n          <span data-block=\"pd-column\">{{ ::case.full_name }}</span>\n        </td>\n        <td>{{ ::case.postcode }}</td>\n        <td>{{ ::case.date_of_birth|date:'dd/MM/yyyy' }}</td>\n        <td>{{ ::case.category }}</td>\n        <td>\n          <timestamp ng-model=\"case.modified\"></timestamp>\n        </td>\n        <td>\n          <abbr class=\"Label Label--secondary\" ng-if=\"case.outcome_code\" title=\"{{ ::case.outcome_description }}\">\n            {{ ::case.outcome_code }}\n          </abbr>\n          <span class=\"Label-helpText\" ng-if=\"::isCallback(case)\">{{ ::case.requires_action_at | date:\"d/M/yy h:mma\" }}</span>\n        </td>\n        <td class=\"u-highlightRed\">{{ ::case.is_urgent ? 'URGENT' : '' }}</td>\n        <td ng-if=\"::user.is_manager\" class=\"u-highlightRed\">{{ ::case.flagged_with_eod ? 'YES' : '' }}</td>\n      </tr>\n    </tbody>\n  </table>\n\n  <div class=\"Notice\" ng-if=\"cases.results.length === 0\">\n    There are no cases<span ng-if=\"!searchParams.search && !searchParams.only\">.</span>\n    <span ng-if=\"searchParams.search || searchParams.only\">\n      matching your <span ng-if=\"searchParams.search\">search</span> criteria.\n    </span>\n  </div>\n\n  <div data-block=\"notices\"></div>\n\n  <dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n\n  <div ng-if=\"pagesObj.length > 1\">\n    <p class=\"Pagination-prefix\">Jump to page</p>\n\n    <select class=\"Pagination-select\" ng-model=\"selectedPage\" ng-change=\"pageChanged(selectedPage)\">\n      <option ng-repeat=\"page in pagesObj\" value=\"{{ page }}\" ng-selected=\"page == selectedPage\">{{ page }}</option>\n    </select>\n  </div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('csv_download_list.html',
        "<header class=\"PageHeader cf\">\n  <h2>CSV Download</h2>\n</header>\n\n<form class=\"FormRow\" name=\"csvDownloadFilters\">\n  <label>\n    Filter by provider:\n    <select name=\"provider\" ng-model=\"provider\" ng-options=\"p.id as p.name for p in providers | orderBy:'name'\" ng-change=\"submitFilters()\">\n      <option value=\"\">(All providers)</option>\n    </select>\n  </label>\n</form>\n\n<table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n  <thead>\n    <tr>\n      <th>Date</th>\n      <th>Date Uploaded</th>\n      <th>Provider</th>\n      <th>Submitted By</th>\n      <th>Rows</th>\n      <th></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr dir-paginate=\"csv in uploads.results | itemsPerPage: 20\"\n        total-items=\"uploads.count\" current-page=\"currentPage\">\n      <td>{{ ::csv.month | date:'MMM yyyy'}} Upload</td>\n      <td>\n        <timestamp ng-model=\"csv.modified\"></timestamp>\n      </td>\n      <td>{{ ::csv.provider }}</td>\n      <td>{{ ::csv.created_by }}</td>\n      <td>{{ ::csv.rows }}</td>\n      <td><a href=\"\" ng-click=\"download(csv)\">Download</a></td>\n    </tr>\n  </tbody>\n</table>\n\n<dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('csv_upload_list.html',
        "<header class=\"PageHeader cf\">\n  <h2>CSV Upload</h2>\n</header>\n\n<div class=\"ErrorSummary\" ng-if=\"errors\">\n  <h2 class=\"ErrorSummary-heading\">Please correct the following errors:</h2>\n  <ul class=\"ErrorSummary-list\">\n    <li class=\"ErrorSummary-listItem\" ng-repeat=\"error in errors\">{{ error }}</li>\n  </ul>\n</div>\n\n<form class=\"FormRow\" name=\"csvForm\" ng-submit=\"submit(csvForm)\">\n  <csv-upload ng-model=\"csvFile\"></csv-upload>\n  <label>\n    <select ng-model=\"month\" ng-required=\"true\" ng-options=\"month.value as month.name for month in validMonths\" required=\"required\">\n    </select>\n  </label>\n  <button type=\"submit\" name=\"submit\" class=\"Button Button--secondary\" ng-disabled=\"csvForm.$invalid\">Upload</button>\n</form>\n\n<table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n  <thead>\n    <tr>\n      <th>Date</th>\n      <th>Date Uploaded</th>\n      <th>Submitted By</th>\n      <th>Rows</th>\n      <th></th>\n      <th></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr dir-paginate=\"csv in uploads.results | itemsPerPage: 20\"\n        total-items=\"uploads.count\" current-page=\"currentPage\">\n      <td>{{ ::csv.month | date:'MMM yyyy'}} Upload</td>\n      <td>\n        <timestamp ng-model=\"csv.modified\"></timestamp>\n      </td>\n      <td>{{ ::csv.created_by }}</td>\n      <td>{{ ::csv.rows }}</td>\n      <td><a href=\"\" ng-show=\"!upload_again\" ng-click=\"upload_again=true\">Upload Again</a>\n        <form ng-show=\"upload_again\" ng-submit=\"overwrite(reuploadFile, csv)\"><csv-upload ng-model=\"reuploadFile\"></csv-upload><button class=\"Button Button--secondary\" name=\"submit\" type=\"submit\">Overwrite</button>\n        </form>\n      </td>\n      <td><a href=\"\" ng-click=\"download(csv)\">Download</a></td>\n    </tr>\n  </tbody>\n</table>\n\n<dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('invalid_modal.html',
        "<header>\n  <h2>{{ ::tplVars.title }}</h2>\n</header>\n\n<div class=\"Error Error--basic\" ng-if=\"tplVars.message\" ng-bind-html=\"::tplVars.message\"></div>\n\n<div class=\"Error Error--basic\" ng-if=\"tplVars.errors.length > 0\" data-case-errors>\n  <p>You must correct the following errors before you can proceed:</p>\n  <ul>\n    <li ng-repeat=\"error in tplVars.errors\">{{ ::error.message }}</li>\n  </ul>\n</div>\n\n<div class=\"Notice\" ng-if=\"tplVars.warnings.length > 0\" data-case-warnings>\n  <p>Please make sure you have checked the following warnings before you can proceed:</p>\n  <ul>\n    <li ng-repeat=\"warning in tplVars.warnings\">{{ ::warning.message }}</li>\n  </ul>\n</div>\n\n<div class=\"FormActions\">\n  <button type=\"button\" name=\"btn-proceed\" class=\"Button\" ng-if=\"tplVars.errors.length === 0\" ng-click=\"proceed()\">Continue</button>\n  <a href=\"\" ng-click=\"close()\">Close</a>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('notes.history.modal.html',
        "<header>\n  <h2>Notes history</h2>\n  <a href=\"\" ng-click=\"toggleSummary()\" class=\"Label\" ng-class=\"{'is-selected': !summary}\" ng-if=\"notes.results.length\">Show in detail</a>\n</header>\n\n<ul class=\"Grid NotesHistory\" ng-if=\"notes.results.length\">\n  <li dir-paginate=\"note in notes.results | itemsPerPage: 5\" total-items=\"notes.count\" current-page=\"currentPage\" class=\"Grid-row NotesHistory-item\">\n    <span class=\"Grid-col Grid-col--1-5\">\n      <timestamp ng-model=\"::note.created\"></timestamp>\n      <br>\n      ({{ ::note.created_by }})\n    </span>\n    <span class=\"Grid-col Grid-col--4-5\">\n      <blockquote class=\"Quote\" ng-bind-html=\"::note.diffHTML|nl2br\"></blockquote>\n    </span>\n  </li>\n</ul>\n\n<p ng-if=\"!notes.results.length\">There are currently no historical notes events for this case.</p>\n\n<nav class=\"cf\">\n  <dir-pagination-controls ng-if=\"notes.results.length\" on-page-change=\"updatePage(newPageNumber)\"></dir-pagination-controls>\n  <button ng-click=\"close()\" class=\"Button Button--text u-pullLeft\">Close</button>\n</nav>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('user_list.html',
        "<header class=\"PageHeader cf\">\n  <div ng-switch on=\"user.is_manager\">\n    <div ng-switch-when=\"true\">\n      <h1 data-block=\"title\">Users</h1>\n    </div>\n    <h1 ng-switch-default>Users</h1>\n  </div>\n\n  <div data-block=\"top-actions\">\n    <button class=\"Button Button--secondary Button--add\" ng-hide=\"showFrm\" ng-click=\"showFrm=true\" name=\"add-user\">Add user</button>\n\n    <div class=\"Grid\">\n      <div class=\"Grid-row\">\n        <form autocomplete=\"off\" ng-submit=\"add_user(add_user_form)\" name=\"add_user_form\" ng-show=\"showFrm\" class=\"VCard VCard-edit Grid-col--1-3\">\n          <div ng-class=\"{'Error': errors || (add_user_form.$invalid && !add_user_form.$pristine)}\">\n            <div data-block=\"form-content\">\n              <label class=\"FormRow FormRow--narrow cf\">\n                <span class=\"Error-message\" ng-show=\"add_user_form.username.$error.server\">{{ errors.full_name }}</span>\n                <span class=\"FormRow-label\">Username</span>\n                <input type=\"text\" class=\"FormRow-field--full\" name=\"username\" required=\"required\" ng-model=\"new_user.username\" server-error>\n              </label>\n\n              <label class=\"FormRow FormRow--narrow cf\">\n                <span class=\"Error-message\" ng-show=\"add_user_form.first_name.$error.server\">{{ errors.first_name }}</span>\n                <span class=\"FormRow-label\">First name</span>\n                <input type=\"text\" class=\"FormRow-field--full\" name=\"first_name\" required=\"required\" ng-model=\"new_user.first_name\" server-error>\n              </label>\n\n              <label class=\"FormRow FormRow--narrow cf\">\n                <span class=\"Error-message\" ng-show=\"add_user_form.last_name.$error.server\">{{ errors.last_name }}</span>\n                <span class=\"FormRow-label\">Last Name</span>\n                <input type=\"text\" class=\"FormRow-field--full\" name=\"last_name\" required=\"required\" ng-model=\"new_user.last_name\" server-error>\n              </label>\n\n              <label class=\"FormRow FormRow--narrow cf\">\n                <span class=\"Error-message\" ng-show=\"add_user_form.email.$error.server\">{{ errors.email }}</span>\n                <span class=\"FormRow-label\">Email</span>\n                <input type=\"email\" class=\"FormRow-field--full\" name=\"email\" required=\"required\" ng-model=\"new_user.email\" server-error>\n              </label>\n\n              <label class=\"FormRow FormRow--narrow cf\">\n                <span class=\"Error-message\" ng-show=\"add_user_form.password.$error.server\">{{ errors.password }}</span>\n                <span class=\"FormRow-label\">Password</span>\n                <input type=\"password\" class=\"FormRow-field--full\" name=\"password\" required=\"required\" ng-model=\"new_user.password\" server-error>\n              </label>\n            </div>\n\n            <div class=\"FormActions\" data-block=\"form-submit\">\n              <button type=\"submit\" class=\"Button\" name=\"submit-add-use\">Add user</button>\n              <button type=\"reset\" class=\"Button Button--text\" name=\"cancel-add-use\" ng-click=\"showFrm=false\">Cancel</button>\n            </div>\n          </div>\n        </form>\n      </div>\n    </div>\n  </div>\n</header>\n\n<div data-block=\"case-list\">\n  <table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n    <thead>\n      <tr data-block=\"column-headers\">\n        <th width=\"15%\">Username</th>\n        <th width=\"10%\">Email</th>\n        <th width=\"15%\">First Name</th>\n        <th width=\"15%\">Last Name</th>\n        <th width=\"5%\">Manager</th>\n        <th width=\"10%\">Last Login</th>\n        <th width=\"10%\">Created</th>\n        <th width=\"10%\"></th>\n        <th width=\"10%\"></th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"user in users\" data->\n        <td>\n          {{ ::user.username }}\n        </td>\n        <td>\n          {{ ::user.email }}\n        </td>\n        <td>{{ ::user.first_name }}</td>\n        <td>{{ ::user.last_name }}</td>\n        <td>\n          {{ ::user.is_manager ? 'Yes' : 'No' }}\n        </td>\n        <td>\n          <timestamp ng-model=\"::user.last_login\"></timestamp>\n        </td>\n        <td>\n          <timestamp ng-model=\"::user.created\"></timestamp>\n        </td>\n        <td>\n          <a href=\"\" ng-click=\"reset_password(user)\">Reset Password</a>\n        </td>\n        <td>\n          <a href=\"\" ng-really-message=\"Are you sure you wish to unlock this account?\" ng-really-click=\"reset_lockout(user)\">Reset Lockout</a>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_detail.assign.html',
        "<!-- no providers -->\n<div class=\"Error Error--basic\" ng-if=\"suggested_providers.length < 1 && !suggested_provider && !case.provider\">\n  <p>There are <strong>no providers available</strong> to assign to this case. Please contact a supervisor.</p>\n</div>\n<!-- no category -->\n<div class=\"Error Error--basic\" ng-if=\"!eligibility_check.category\">\n  <p>This case has <strong>no category of law assigned</strong> but you can still manually assign a provider.</p>\n</div>\n\n<form method=\"post\" name=\"assign_provider_form\" ng-submit=\"assign(assign_provider_form)\">\n  <h2 class=\"FormBlock-label\">Matter types</h2>\n  <div class=\"FormBlock FormBlock--grey\" ng-if=\"::canAssign()\">\n    <div class=\"FormRow\">\n      <label for=\"matter_type1\">\n        <span class=\"FormRow-label\">Matter type 1</span>\n        <select ui-select2=\"{allowClear: true}\" ng-model=\"::case.matter_type1\" ng-options=\"s.code as (s.code + ' - ' + s.description) for s in matter1_types track by s.code\" id=\"matter_type1\" name=\"matter_type1\" data-placeholder=\"Choose a matter type\" class=\"FormRow-field--full\">\n          <option value=\"\"></option>\n        </select>\n      </label>\n    </div>\n\n    <div class=\"FormRow\">\n      <label for=\"matter_type2\">\n        <span class=\"FormRow-label\">Matter type 2</span>\n        <select ui-select2=\"{allowClear: true}\" ng-model=\"::case.matter_type2\" ng-options=\"s.code as (s.code + ' - ' + s.description) for s in matter2_types track by s.code\" id=\"matter_type2\" name=\"matter_type2\" data-placeholder=\"Choose a matter type\" class=\"FormRow-field--full\">\n          <option value=\"\"></option>\n        </select>\n      </label>\n    </div>\n  </div>\n\n  <div ng-if=\"::!canAssign()\" class=\"SummaryBlock SummaryBlock--compact\">\n    <p class=\"SummaryBlock-content\" ng-if=\"::case.matter_type1\">\n      <strong>Matter type 1:</strong> {{ ::case.matter_type1 }} - {{ ::getMTDescription(case.matter_type1) }}\n    </p>\n    <p class=\"SummaryBlock-content\" ng-if=\"::case.matter_type2\">\n      <strong>Matter type 2:</strong> {{ ::case.matter_type2 }} - {{ ::getMTDescription(case.matter_type2) }}\n    </p>\n  </div>\n\n  <call-script ng-if=\"suggested_providers.length > 1 || suggested_provider\">\n    <p>Based on what you have told me I can put you through to a CLA Specialist Advisor. They will check what you have told me and assess whether our service is right for you.</p>\n    <p>If you qualify for legal aid you will need to provide proof of your financial circumstances to the specialist.</p>\n    <p>If they do take on your case they will provide you legal advice remotely via email, letters and phone calls until the conclusion of your case. You won’t be able to get advice from any other legal aid providers on this issue.</p>\n    <p>Is there anything else we can help you with today?</p>\n    <p>If you need any further help please call us back. We are open from 9am-8pm Monday to Friday and 9am-12:30pm on Saturdays.</p>\n  </call-script>\n\n  <div ng-if=\"selected_provider.id\">\n    <h2 class=\"FormBlock-label\" ng-if=\"case.provider\">Assigned to</h2>\n    <div class=\"ContactBlock ContactBlock--grey clearfix\">\n      <h2 class=\"ContactBlock-heading\">{{ selected_provider.name }}</h2>\n\n      <p>{{ selected_provider.telephone_frontdoor }} (Front door)\n        <br>{{ selected_provider.telephone_backdoor }} (Back door)</p>\n\n      <p>Provider phone short code: <strong>{{ selected_provider.short_code }}</strong></p>\n    </div>\n  </div>\n\n  <div ng-show=\"is_manual && suggested_providers.length > 0\">\n    <div class=\"FormRow cf\">\n      <input type=\"text\" name=\"assign-provider-search\" placeholder=\"Search providers and other help organisations\" class=\"FormRow-field--l\" ng-model=\"::provider_search\" search-filter>\n    </div>\n\n    <div class=\"FormRow FormRow--group\" ng-repeat=\"provider in suggested_providers | filter:provider_search\">\n      <label class=\"FormRow-label FormRow-label--odd\">\n        <input name=\"provider\" type=\"radio\" ng-model=\"::$parent.selected_provider\" ng-value=\"provider\">\n        <strong>{{ ::provider.name }}</strong>\n\n        <p class=\"FormRow-inner\">{{ ::provider.telephone_frontdoor }} (Front door)\n          <br>{{ ::provider.telephone_backdoor }} (Back door)</p>\n\n        <p>Provider phone short code <strong>{{ ::provider.short_code }}</strong></p>\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label for=\"notes\" class=\"visuallyhidden\">Reassignment notes</label>\n      <textarea name=\"notes\" id=\"notes\" cols=\"30\" rows=\"4\" ng-model=\"::notes\" placeholder=\"Provider reassignment comments\"></textarea>\n    </div>\n\n    <label class=\"FormRow cf\" ng-if=\"user.is_manager\">\n      <input type=\"checkbox\" name=\"is_manual_ref\" ng-model=\"$parent.is_manual_ref\" ng-change=\"$parent.is_spor=false\">\n      Assign as manual reference (MANREF)\n    </label>\n  </div>\n\n  <div class=\"Notice\">\n    <label>\n      <input type=\"checkbox\" name=\"is_spor\" ng-model=\"is_spor\" ng-disabled=\"!selected_provider.id || is_manual_ref\">\n      Refer for second opinion (SPOR)\n    </label>\n  </div>\n\n  <div class=\"Notice\">\n    <label>\n      <input type=\"checkbox\" name=\"is_urgent\" ng-model=\"is_urgent\">\n      This case requires urgent attention\n    </label>\n  </div>\n\n  <div class=\"Error Error--basic\" ng-if=\"errors.__all__\">\n    <p class=\"Error-message\">{{ errors.__all__ }}</p>\n  </div>\n\n  <div class=\"FormActions\" ng-if=\"::canAssign()\">\n    <button type=\"submit\" name=\"assign-provider\" class=\"Button\" ng-disabled=\"!selected_provider.id\">Assign provider</button>\n\n    <a ui-sref=\"case_detail.defer_assignment\" class=\"Button Button--secondary\">Defer</a>\n\n    <button type=\"button\" name=\"assign-manually\" class=\"Button Button--secondary\" ng-click=\"assignManually(true)\" ng-if=\"!is_manual && suggested_providers.length > 0\">Assign manually</button>\n\n    <button type=\"button\" ng-click=\"decline_help()\" class=\"Button Button--secondary\" ng-if=\"is_manual && suggested_provider.id\" ng-controller=\"CaseDetailDeclineHelpCtrl\">Decline help</button>\n\n    <a href=\"\" ng-click=\"assignManually(false)\" ng-if=\"is_manual && suggested_provider.id\">Cancel</a>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_detail.defer_assignment.html',
        "<header class=\"PageHeader cf\">\n    <h1 class=\"u-pullLeft\">Defer specialist provider assignment</h1>\n</header>\n\n<div class=\"FormBlock FormBlock--yellow\">\n  <form method=\"post\" ng-submit=\"defer()\">\n    <div class=\"FormRow cf\">\n      <label for=\"id_event_notes\" class=\"visuallyhidden\">notes</label>\n      <textarea class=\"FormRow-field--full\" cols=\"20\" id=\"id_event_notes\" name=\"notes\" rows=\"6\" ng-model=\"::notes\" placeholder=\"Notes\"></textarea>\n    </div>\n\n    <button type=\"submit\" class=\"Button\">Defer Assignment</button>\n    <a ui-sref=\"case_detail.assign\">Cancel</a>\n  </form>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_detail.diversity.html',
        "<div ng-if=\"personal_details.has_diversity\">\n  <section class=\"SummaryBlock SummaryBlock--compact\">\n    <div class=\"SummaryBlock-content\">\n      <p>The client has completed diversity monitoring.</p>\n    </div>\n  </section>\n</div>\n\n<div ng-if=\"!personal_details.has_diversity\">\n  <call-script>\n    <p>Before I transfer you through can I ask some diversity questions?</p>\n    <p>Your answers will be treated confidentially and you cannot be identified from them. We use the data we collect to monitor the service that we provide.</p>\n  </call-script>\n\n  <section class=\"SummaryBlock SummaryBlock--compact\">\n    <div class=\"SummaryBlock-content cf\" ng-repeat=\"statement in sections\" ng-if=\"statement.answer\">\n      <a class=\"u-pullRight\" href=\"\" ng-click=\"gotoStep($index+1)\">Change answer</a>\n      <p class=\"u-pullLeft\"><strong>{{ ::statement.title }}:</strong> {{ getDisplayLabel(statement.answer, statement.options) }}</p>\n    </div>\n  </section>\n\n  <form ng-submit=\"save(frmDiversity.$valid)\" novalidate name=\"frmDiversity\">\n\n    <div ng-repeat=\"section in sections\" ng-if=\"current.step-1 === $index\">\n      <h2 class=\"FormBlock-label\">{{ ::section.title }}</h2>\n\n      <div class=\"FormRow cf\">\n        <input type=\"text\" name=\"diversity-{{ ::section.name }}-filter\" placeholder=\"Filter answers\" class=\"FormRow-field--l\" ng-model=\"::code_search\" search-filter>\n      </div>\n\n      <call-script ng-show=\"section.script\">\n        <div ng-bind-html=\"::section.script\"></div>\n      </call-script>\n\n      <div class=\"FormBlock FormBlock--grey\">\n        <div class=\"FormRow FormRow--group FormRow--groupNarrow\" ng-repeat=\"opt in section.options | filter:code_search\">\n          <label class=\"FormRow-label\">\n            <input type=\"radio\" name=\"{{ ::section.name }}\" value=\"{{ ::opt.value }}\" ng-model=\"current.answer\" required>\n            <span class=\"FormRow-labelText FormRow-labelText--basic\">{{ ::opt.text }}</span>\n          </label>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"Error Error--basic\" ng-if=\"frmDiversity.$error && submitted\">\n      <p>Please select an choice from the options</p>\n    </div>\n\n    <div class=\"FormActions\">\n      <button type=\"button\" class=\"Button\" name=\"diversity-next\" ng-click=\"nextStep(frmDiversity.$valid)\" ng-if=\"current.step < sections.length\">Next</button>\n\n      <call-script ng-if=\"current.step === sections.length\">\n        <p>Thank you very much for completing those questions.</p>\n      </call-script>\n      <button type=\"submit\" class=\"Button\" name=\"diversity-save\" ng-if=\"current.step === sections.length\">Save</button>\n\n      <button type=\"button\" class=\"Button Button--text\" name=\"diversity-back\" ng-click=\"previousStep()\" ng-if=\"current.step > 1 && current.step < sections.length\">Back</button>\n    </div>\n\n  </form>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_detail.edit.html',
        "<div data-extend-template=\"case_detail.edit.html\">\n  <span data-block=\"extra-tabs\">\n    <li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('case_detail.diversity'), 'is-disabled': !case.personal_details}\">\n      <a ui-sref=\"case_detail.diversity\" class=\"Tabs-tabLink\" ng-class=\"{'Icon Icon--right Icon--solidTick Icon--green': personal_details.has_diversity}\">Diversity</a>\n    </li>\n    <li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('case_detail.assign'), 'is-disabled': !case.isInScopeAndEligible()}\">\n      <a ui-sref=\"case_detail.assign\" class=\"Tabs-tabLink\" ng-class=\"{'Icon Icon--right Icon--solidTick Icon--green': case.provider}\">Assign</a>\n    </li>\n  </span>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_detail.eod_details_modal.html',
        "<header>\n  <h2>Expressions of Dissatisfaction</h2>\n</header>\n\n<form novalidate ng-submit=\"submit(eod_frm, action)\" name=\"eod_frm\">\n  <p class=\"Error-message\" ng-if=\"errors.__all__\">{{ errors.__all__ }}</p>\n\n  <div class=\"FormBlock FormBlock--yellow\">\n\n    <div class=\"FormRow cf\">\n      <input id=\"eod-modal-search\" type=\"text\" placeholder=\"Search categories\" class=\"FormRow-field--l\" ng-model=\"::category_search\" search-filter>\n    </div>\n\n    <fieldset class=\"FormRow\">\n      <div class=\"FormRow FormRow--group FormRow--groupNarrow FormRow--ruled\" ng-repeat=\"eod in EXPRESSIONS_OF_DISSATISFACTION | filter:category_search\">\n        <label class=\"FormRow-label u-pullLeft\">\n          <input type=\"checkbox\" value=\"{{ ::eod.value }}\" ng-checked=\"isCategorySelected(eod.value)\" ng-click=\"toggleCategory(eod.value)\">\n          <span class=\"u-mute\">{{ ::eod.text }}</span>\n        </label>\n\n        <label class=\"u-pullRight\" ng-if=\"isCategorySelected(eod.value) && categoryNeedsMajorFlag(eod.value)\">\n          <input type=\"checkbox\" ng-checked=\"isCategoryFlaggedMajor(eod.value)\" ng-click=\"toggleCategoryMajorFlag(eod.value)\">\n          <span class=\"u-mute\">Major issue?</span>\n        </label>\n      </div>\n    </fieldset>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <textarea class=\"FormRow-field--full\" cols=\"20\" rows=\"6\" ng-model=\"eod_details_model.notes\" placeholder=\"Notes\"></textarea>\n      </label>\n    </div>\n\n  </div>\n\n  <div class=\"FormActions\" data-block=\"formActions\">\n    <button class=\"Button\" type=\"submit\" ng-click=\"action='save'\">Save</button>\n    <a href=\"\" ng-click=\"cancel()\">Cancel</a>\n\n    <span style=\"float:right\">\n      <span ng-if=\"case.complaint_flag\" ng-switch=\"user.is_manager\">\n        <span ng-switch-default>\n          Open complaints exist\n        </span>\n        <button class=\"Button Button--secondary\" type=\"submit\" ng-click=\"cancel('complaints_list', {'search': case.reference})\" ng-switch-when=\"true\" title=\"See list of associated complaints\">\n          {{ case.complaint_count }} open complaint(s) exist\n        </button>\n      </span>\n      <button class=\"Button Button--warning\" type=\"submit\" ng-click=\"action='escalate'\">\n        Escalate to new complaint\n      </button>\n    </span>\n  </div>\n\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_detail.html',
        "<div data-extend-template=\"case_detail.html\">\n  <nav class=\"CaseBar-actions BtnGroup\" data-block=\"case-actions\">\n    <a ui-sref=\"case_detail.suspend\" class=\"BtnGroup-button BtnGroup-button--light\" title=\"Suspend case\"><span class=\"Icon Icon--compact Icon--suspend\"></span></a>\n    <callback-button case=\"case\"><span class=\"Icon Icon--compact Icon--callback\"></span></callback-button>\n    <a ui-sref=\"case_detail.alternative_help\" class=\"BtnGroup-button BtnGroup-button--light\" title=\"Assign alternative help\"><span class=\"Icon Icon--compact Icon--altHelp\"></span></a>\n  </nav>\n\n  <callback-modal data-block-after=\"case-header\"></callback-modal>\n\n  <callback-status data-block-prepend=\"rh-col\" case=\"case\"></callback-status>\n\n  <div class=\"FormActions\" data-block=\"case-eod_details\" ng-class=\"{'Icon--formRow': !personal_details.reference && !personal_details_frm_visible}\">\n    <button class=\"Button Button--add Button--secondary\" ui-sref=\"case_detail.eod_details\" title=\"Expressions of Dissatisfaction\">\n      Add EOD\n      <span class=\"Badge Badge--warning\" ng-if=\"eod_details && eod_details.$eodBadge()\">\n        {{ eod_details.$eodBadge() }}\n      </span>\n    </button>\n    <button class=\"Button Button--secondary\" ui-sref=\"complaints_list({'search': case.reference})\" ng-if=\"user.is_manager && case.complaint_count\" title=\"See list of associated complaints\">\n      List complaints\n      <span class=\"Badge Badge--warning\">\n        {{ case.complaint_count }}\n      </span>\n    </button>\n  </div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_list.callbacks.html',
        "<callback-matrix slots=\"slotData\" cases=\"callbackCases\"></callback-matrix>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/case_list.html',
        "<div data-extend-template=\"case_list.html\">\n  <div data-block=\"title\" ng-include=\"'call_centre/includes/case_tab_navigation.html'\"></div>\n\n  <span data-block=\"filters\">\n    <button type=\"button\" name=\"person-filter\" class=\"Label is-selected is-removable\" ng-if=\"person.reference\" ng-click=\"backToLatestSearch()\">\n      {{ ::person.full_name }}<span ng-if=\"person.postcode\"> ({{ ::person.postcode }})</span>\n    </button>\n\n    <span class=\"LabelGroup\">\n      <span class=\"GroupPrefix\">Showing:</span>\n      <a href=\"\" class=\"Label\" ng-class=\"filterClass('')\" ng-click=\"filterCases('')\">All</a>\n      <a href=\"\" class=\"Label\" ng-class=\"filterClass('phone')\" ng-click=\"filterCases('phone')\">Phone cases</a>\n      <a href=\"\" class=\"Label\" ng-class=\"filterClass('web')\" ng-click=\"filterCases('web')\">Web cases</a>\n      <a href=\"\" class=\"Label\" ng-class=\"filterClass('eod')\" ng-click=\"filterCases('eod')\" ng-if=\"::user.is_manager\">EOD</a>\n      <a href=\"\" class=\"Label\" ng-class=\"filterClass('my')\" ng-click=\"filterCases('my')\">My cases</a>\n    </span>\n  </span>\n\n  <nav data-block=\"page-nav\" class=\"u-pullRight\" ng-if=\"user.is_manager\">\n    <a ui-sref=\"case_list\" class=\"BtnGroup-button BtnGroup-button--light\" ng-class=\"{'is-selected': $state.is('case_list')}\"><span class=\"Icon Icon--compact Icon--list\"></span></a>\n    <a ui-sref=\"case_list.callbacks\" class=\"BtnGroup-button BtnGroup-button--light\" ng-class=\"{'is-selected': $state.is('case_list.callbacks')}\"><span class=\"Icon Icon--compact Icon--date\"></span></a>\n  </nav>\n\n  <div data-block=\"top-actions\">\n    <form name=\"newCaseForm\" class=\"newCaseForm u-pullLeft\">\n      <button id=\"create_case\" type=\"button\" class=\"Button Button--secondary Button--add\" ng-click=\"addCase(person.reference)\" ng-if=\"person.reference\">Create a case for {{ person.full_name }}</button>\n      <button id=\"create_case\" type=\"button\" class=\"Button Button--secondary Button--add\" ng-click=\"addCase()\" ng-if=\"!person.reference\">Create a case</button>\n    </form>\n  </div>\n\n  <p data-block=\"notices\" class=\"Notice\" ng-if=\"historicCases.count > 0\">There are <strong>{{ historicCases.count }} historic cases</strong> (from capita's system) that match your search criteria. <a ui-sref=\"historic_list({search: searchParams.search})\">View historic cases</a></p>\n\n  <span data-block=\"pd-column\">\n    <!-- if multi cases -->\n    <a href=\"\" ng-if=\"!person.reference && case.full_name\" ng-click=\"filterByPerson(case.personal_details)\">{{ ::case.full_name }}<span ng-if=\"case.case_count > 1\"> ({{ ::case.case_count }})</span></a>\n    <!-- else -->\n    <span ng-if=\"person.reference\">{{ ::case.full_name }}</span>\n  </span>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/complaint.html',
        "<header class=\"CaseBar Grid\" hl-sticky=\"\" use-placeholder data-block=\"case-header\">\n  <div class=\"Grid-row\">\n    <div class=\"Grid-col Grid-col--1-5\">\n      <h1 class=\"CaseBar-caseNum Icon Icon--folder\">\n        <a href=\"\" ng-click=\"goToComplaint(complaint)\">\n          {{ ::complaint.case_reference }}\n        </a>\n      </h1>\n    </div>\n    <div class=\"Grid-col Grid-col--4-5\">&nbsp;</div>\n  </div>\n</header>\n\n<div class=\"Grid\">\n  <div class=\"Grid-row\">\n\n    <div class=\"Grid-col Grid-col--1-5\">\n      <nav class=\"SubNav\">\n        <a ui-sref=\"complaints_list(complaintsListStateParams)\" class=\"SubNav-link SubNav-link--back\">Back to complaints</a>\n      </nav>\n      <section id=\"personal_details\">\n\n        <!-- read-only details -->\n        <div class=\"VCard\">\n          <h2 class=\"VCard-title\">\n            <a href=\"\" ng-click=\"goToCase(complaint.case_reference)\" class=\"Icon Icon--formRow Icon--folder\" title=\"Go to case\">\n              {{ ::complaint.case_reference }}\n            </a>\n          </h2>\n          <p class=\"VCard-row Icon Icon--row\" ng-class=\"statusClass()\">\n            <span ng-if=\"complaint.closed\">\n              Closed\n              <timestamp ng-model=\"complaint.closed\"></timestamp>\n              <br/>\n            </span>\n            <span ng-if=\"!complaint.closed\">\n              Created <strong><timestamp ng-model=\"complaint.created\"></timestamp></strong>\n              by <strong>{{ ::getUserDisplayName(complaint.created_by) }}</strong>\n              <br/>\n            </span>\n            {{ displayStatus() }}\n          </p>\n          <p class=\"VCard-row Icon Icon--row\" ng-class=\"{'Icon--tick': !complaint.holding_letter_out_of_sla, 'Icon--cross Icon--red': complaint.holding_letter_out_of_sla}\" ng-if=\"complaint.holding_letter !== null || complaint.holding_letter_out_of_sla\">\n            <span ng-if=\"complaint.holding_letter !== null\">\n              Holding letter sent <timestamp ng-model=\"complaint.holding_letter\"></timestamp>\n            </span>\n            <span ng-if=\"complaint.holding_letter === null && complaint.holding_letter_out_of_sla\">\n              Holding letter not sent\n            </span>\n          </p>\n          <p class=\"VCard-row Icon Icon--row Icon--tick\" ng-if=\"complaint.full_letter !== null\">\n            Full response sent <timestamp ng-model=\"complaint.full_letter\"></timestamp>\n          </p>\n          <p class=\"VCard-row Icon Icon--row Icon--alert Icon--red\" ng-if=\"complaint.out_of_sla\">\n            Out of SLA\n          </p>\n          <p ng-if=\"complaint.full_name\" class=\"VCard-row Icon Icon--row Icon--user\" title=\"Full name\">\n            {{ ::complaint.full_name }}\n          </p>\n          <p ng-if=\"complaint.category_of_law\" class=\"VCard-row Icon Icon--row\" title=\"Category of law\">\n            {{ ::complaint.category_of_law }}\n          </p>\n          <div ng-if=\"personal_details.postcode || personal_details.street\" class=\"VCard-row Icon Icon--row Icon--location\" title=\"Address\">\n            <p class=\"u-compact\" ng-if=\"personal_details.postcode\">{{ ::personal_details.postcode }}</p>\n            <p class=\"u-compact\" ng-bind-html=\"personal_details.street|escapeHtml|nl2br\"></p>\n          </div>\n          <p ng-if=\"personal_details.mobile_phone\" class=\"VCard-row Icon Icon--row Icon--call\" ng-class=\"{'Icon--red Icon--dontcall': personal_details.safe_to_contact === 'DONT_CALL', 'Icon--red Icon--novoicemail': personal_details.safe_to_contact === 'NO_MESSAGE', 'Icon--green': personal_details.safe_to_contact === 'SAFE'}\" title=\"Phone number\">\n            <span ng-class=\"{'u-strike': personal_details.safe_to_contact !== 'SAFE'}\">{{ ::personal_details.mobile_phone }}</span>\n          </p>\n          <p ng-if=\"personal_details.email\" class=\"VCard-row Icon Icon--row Icon--email\" title=\"Email address\">\n            {{ ::personal_details.email }}\n          </p>\n        </div>\n\n        <!-- complaint details when not editing or frozen -->\n        <div ng-click=\"showDetailsForm(complaintDetailsFrm)\" ng-show=\"!complaintDetailsFrm.$visible\" class=\"VCard VCard-view\">\n          <p class=\"VCard-row\" ng-if=\"complaint.description\">\n            {{ complaint.description }}\n          </p>\n          <p class=\"VCard-row\" ng-if=\"complaint.category\">\n            <strong>Category:</strong> {{ displayMappedValue('categories', complaint.category) }}\n          </p>\n          <p class=\"VCard-row\" ng-if=\"complaint.source\">\n            <strong>Source:</strong> {{ displayMappedValue('sources', complaint.source) }}\n          </p>\n          <p class=\"VCard-row\" ng-if=\"complaint.owner\">\n            <strong>Owner:</strong> {{ getUserDisplayName(findManager(complaint.owner)) }}\n          </p>\n          <p class=\"VCard-row\" ng-if=\"complaint.level\">\n            {{ displayMappedValue('levels', complaint.level) }}\n          </p>\n          <p class=\"VCard-row\" ng-if=\"complaint.justified !== null\">\n            {{ displayMappedValue('justified', complaint.justified) }}\n          </p>\n        </div>\n\n        <!-- complaint details when editing -->\n        <form novalidate autocomplete=\"off\" method=\"post\" name=\"complaintDetailsFrm\" onbeforesave=\"validateComplaintDetails(complaintDetailsFrm.$valid)\" onaftersave=\"saveComplaintDetails(complaintDetailsFrm)\" ng-show=\"complaintDetailsFrm.$visible\" editable-form class=\"VCard VCard-edit\">\n          <label class=\"FormRow FormRow--narrow cf\">\n            <span class=\"Error-message\" ng-if=\"complaintDetailsFrm.description.$error.server\">{{ errors.description }}</span>\n            <span editable-textarea=\"complaint.description\" e-name=\"description\" e-class=\"FormRow-field--full\" e-placeholder=\"Brief description\" e-server-error></span>\n          </label>\n          <label class=\"FormRow FormRow--narrow cf\">\n            <span class=\"Error-message\" ng-if=\"complaintDetailsFrm.category.$error.server\">{{ errors.category }}</span>\n            <span editable-filterselect=\"complaint.category\" e-name=\"category\" e-ng-options=\"item.id as item.name for item in complaintCategories track by item.id\" e-class=\"FormRow-field--full\" e-data-placeholder=\"Choose a category\"></span>\n          </label>\n          <label class=\"FormRow FormRow--narrow cf\">\n            <span class=\"Error-message\" ng-if=\"complaintDetailsFrm.source.$error.server\">{{ errors.source }}</span>\n            <span editable-filterselect=\"complaint.source\" e-name=\"source\" e-ng-options=\"item.value as item.description for item in complaintConstants.sources track by item.value\" e-class=\"FormRow-field--full\" e-data-placeholder=\"Choose a source\"></span>\n          </label>\n          <label class=\"FormRow FormRow--narrow cf\">\n            <span class=\"Error-message\" ng-if=\"complaintDetailsFrm.owner.$error.server\">{{ errors.owner }}</span>\n            <span editable-filterselect=\"complaint.owner\" e-name=\"owner\" e-ng-options=\"item.username as getUserDisplayName(item) for item in managers track by item.username\" e-class=\"FormRow-field--full\" e-data-placeholder=\"Choose an owner\"></span>\n          </label>\n          <label class=\"FormRow FormRow--narrow cf\">\n            <span class=\"Error-message\" ng-if=\"complaintDetailsFrm.level.$error.server\">{{ errors.level }}</span>\n            <span editable-filterselect=\"complaint.level\" e-name=\"level\" e-ng-options=\"item.value as item.description for item in complaintConstants.levels track by item.value\" e-class=\"FormRow-field--full\" e-data-placeholder=\"Minor or major?\"></span>\n          </label>\n          <label class=\"FormRow FormRow--narrow cf\">\n            <span class=\"Error-message\" ng-if=\"complaintDetailsFrm.justified.$error.server\">{{ errors.justified }}</span>\n            <span editable-filterselect=\"complaint.justified\" e-name=\"justified\" e-ng-options=\"item.value + '' as item.description for item in complaintConstants.justified track by item.value + ''\" e-class=\"FormRow-field--full\" e-data-placeholder=\"Is the complaint justified?\"></span>\n          </label>\n\n          <div class=\"FormActions cf\">\n            <button type=\"submit\" class=\"Button\">Save details</button>\n            <button type=\"reset\" class=\"Button Button--text\" ng-click=\"cancelComplaintDetails(complaintDetailsFrm)\">Cancel</button>\n          </div>\n        </form>\n\n      </section>\n    </div>\n\n    <div class=\"Grid-col Grid-col--4-5 Guidance-buffer\" ui-view full-height data-centre-col>\n      <header class=\"PageHeader cf ng-scope\">\n        <h1 class=\"ng-binding\">Complaint details</h1>\n      </header>\n\n      <form method=\"post\" ng-submit=\"reopenComplaint()\" ng-if=\"complaint.closed !== null\">\n        <button type=\"submit\" class=\"Button Button--warning\">Reopen complaint</button>\n      </form>\n\n      <form method=\"post\" ng-submit=\"saveAction(actionFrm)\" name=\"actionFrm\" ng-if=\"complaint.closed === null\">\n        <div class=\"FormRow cf\" ng-class=\"{'Error': actionFrm.event_code.$invalid}\">\n          <ul class=\"ErrorSummary-list\" ng-messages=\"actionFrm.event_code.$error\">\n            <li class=\"ErrorSummary-listItem\" ng-message=\"server\">{{ errors.event_code }}</li>\n          </ul>\n\n          <select name=\"event_code\" ng-model=\"currentAction.event_code\" ng-options=\"item.value as item.description for item in complaintConstants.actions\" server-error></select>\n        </div>\n\n        <div class=\"FormRow cf\" ng-class=\"{'Error': actionFrm.resolved.$invalid}\" ng-show=\"currentAction.event_code == 'COMPLAINT_CLOSED'\">\n          <ul class=\"ErrorSummary-list\" ng-messages=\"actionFrm.resolved.$error\">\n            <li class=\"ErrorSummary-listItem\" ng-message=\"server\">{{ errors.resolved }}</li>\n          </ul>\n\n          <label>\n            Complaint is\n            <select name=\"resolved\" ng-model=\"currentAction.resolved\" ng-options=\"item.value as item.description for item in complaintConstants.resolved\" server-error></select>\n          </label>\n        </div>\n\n        <div class=\"FormRow cf\" ng-class=\"{'Error': actionFrm.notes.$invalid}\">\n          <ul class=\"ErrorSummary-list\" ng-messages=\"actionFrm.notes.$error\">\n            <li class=\"ErrorSummary-listItem\" ng-message=\"server\">{{ errors.notes }}</li>\n            <li class=\"ErrorSummary-listItem\" ng-message=\"maxlength\">This field is limited to 10000 characters</li>\n          </ul>\n\n          <label class=\"cf\">\n            <textarea class=\"FormRow-field--full\" name=\"notes\" ng-model=\"currentAction.notes\" placeholder=\"{{ getLogMessages(currentAction.event_code, 'notesPlaceholder') }}\" cols=\"20\" rows=\"10\" ng-maxlength=\"10000\" server-error></textarea>\n          </label>\n        </div>\n\n        <div class=\"FormRow cf\">\n          <button type=\"submit\" class=\"Button\" name=\"save-action\">{{ getLogMessages(currentAction.event_code, 'button') }}</button>\n        </div>\n      </form>\n\n      <ul class=\"CaseHistory\">\n        <li ng-repeat=\"log in complaintLogs.logs\" class=\"CaseHistory-card ComplaintHistory-card\">\n          <span>\n            <timestamp ng-model=\"log.created\"></timestamp>\n            ({{ ::log.created_by }})\n          </span>\n          <ul class=\"CaseHistory-log\">\n            <li class=\"CaseHistory-logItem cf\">\n              <!-- <strong>{{ ::getLogMessages(log.code, 'logHeading') }}</strong> -->\n              <span class=\"CaseHistory-logItemNotes\">{{ ::log.notes }}</span>\n            </li>\n          </ul>\n        </li>\n      </ul>\n    </div>\n\n  </div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/complaints_list.html',
        "<header class=\"PageHeader cf\">\n  <div ng-include=\"'call_centre/includes/case_tab_navigation.html'\"></div>\n</header>\n\n<form>\n  <a href=\"\" class=\"Label toggle-resolved\" ng-class=\"{'is-selected': showingClosed}\" ng-click=\"toggleShowClosed()\">{{ showingClosed ? 'Hide' : 'Show' }} closed complaints</a>\n</form>\n\n<div class=\"Notice\" ng-if=\"complaintsList.count === 0\">\n  There are no complaints\n</div>\n<table class=\"ListTable\" ng-if=\"complaintsList.count > 0\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n  <thead>\n    <tr data-block=\"column-headers\">\n      <th colspan=\"2\"><a href=\"\" ng-click=\"orderToggle('eod__case__reference')\" ng-class=\"orderClass('eod__case__reference')\">Case reference</a></th>\n      <th><a href=\"\" ng-click=\"orderToggle('eod__case__personal_details__full_name')\" ng-class=\"orderClass('eod__case__personal_details__full_name')\">Complainant name</a></th>\n      <th><a href=\"\" ng-click=\"orderToggle('category__name')\" ng-class=\"orderClass('category__name')\">Category</a></th>\n      <th><a href=\"\" ng-click=\"orderToggle('level')\" ng-class=\"orderClass('level')\">Major/minor</a></th>\n      <th><a href=\"\" ng-click=\"orderToggle('justified')\" ng-class=\"orderClass('justified')\">Justified</a></th>\n      <th><a href=\"\" ng-click=\"orderToggle('created')\" ng-class=\"orderClass('created')\">Date received</a></th>\n      <th><a href=\"\" ng-click=\"orderToggle('closed')\" ng-class=\"orderClass('closed')\">Date closed</a></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-class=\"statusClass(complaint)\" dir-paginate=\"complaint in complaintsList.results | itemsPerPage: 20\" total-items=\"complaintsList.count\" current-page=\"currentPage\">\n      <td><a href=\"\" class=\"Icon Icon--alert Icon--red\" ng-click=\"goToComplaint(complaint)\" ng-if=\"complaint.out_of_sla\" title=\"Out of SLA\"></a></td>\n      <td><a href=\"\" ng-click=\"goToComplaint(complaint)\">{{ complaint.case_reference }}</a></td>\n      <td><a href=\"\" ng-click=\"goToComplaint(complaint)\">{{ complaint.full_name }}</a></td>\n      <td>{{ complaint.category_name }}</td>\n      <td>{{ displayMappedValue('levels', complaint.level) }}</td>\n      <td>{{ displayMappedValue('justified', complaint.justified) }}</td>\n      <td><timestamp ng-model=\"complaint.created\"></timestamp></td>\n      <td>\n        <span ng-if=\"complaint.closed\">\n          <span ng-switch=\"complaint.voided\">\n            <span ng-switch-when=\"null\">{{ displayMappedValue('resolved', complaint.resolved) }}</span>\n            <span ng-switch-default>Voided</span>\n          </span>\n          <timestamp ng-model=\"complaint.closed\"></timestamp>\n        </span>\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/confirmation_modal.html',
        "<header>\n  <h2>{{ ::tplVars.title }}</h2>\n</header>\n\n<div class=\"Notice\">\n  <p ng-bind-html=\"::tplVars.message\"></p>\n</div>\n\n<div class=\"FormActions\">\n  <button type=\"button\" name=\"modal-confirm\" class=\"Button\" ng-click=\"confirm()\">{{ ::tplVars.buttonText }}</button>\n  <button type=\"button\" name=\"modal-cancel\" class=\"Button Button--text\" ng-click=\"cancel()\">Cancel</a>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/feedback_list.html',
        "<header class=\"PageHeader cf\">\n  <div ng-include=\"'call_centre/includes/case_tab_navigation.html'\"></div>\n</header>\n\n<form class=\"FormRow\" ng-submit=\"filter()\">\n  <label>\n    <span class=\"visuallyhidden\">From date</span>\n    <input type=\"text\" name=\"start\" ng-model=\"::startDate\" class=\"FormRow-field--m FormRow-field--inline\" placeholder=\"From\" date-picker>\n  </label>\n\n  <label>\n    <span class=\"visuallyhidden\">To date</span>\n    <input type=\"text\" name=\"end\" ng-model=\"::endDate\" class=\"FormRow-field--m FormRow-field--inline\" placeholder=\"To\" date-picker>\n  </label>\n\n  <button type=\"submit\" name=\"update-filter\" class=\"Button Button--secondary\">Search by date</button>\n\n  <a href=\"\" class=\"Label toggle-resolved\" ng-class=\"{'is-selected': !hideResolved}\" ng-click=\"toggleResolvedState()\">{{ hideResolved ? 'Show' : 'Hide' }} resolved cases</a>\n</form>\n\n<table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n  <thead>\n    <tr>\n      <th width=\"9%\">Resolved</th>\n      <th width=\"13%\">Case Reference</th>\n      <th width=\"21%\">Issue</th>\n      <th width=\"30%\">Comment</th>\n      <th width=\"12%\">Justified</th>\n      <th width=\"15%\">Created</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr dir-paginate=\"feedback in feedbackList.results | itemsPerPage: 20\"\n      total-items=\"feedbackList.count\" current-page=\"currentPage\" ng-if=\"showRow(feedback)\" ng-class=\"{'is-complete': feedback.resolved}\">\n      <td>\n        <input type=\"checkbox\" name=\"resolved\" ng-click=\"toggleResolved(feedback)\" data-case=\"{{ ::feedback.case }}\" ng-checked=\"feedback.resolved\">\n      </td>\n      <td>\n        <a ui-sref=\"case_detail.edit.diagnosis({caseref: feedback.case})\">{{ ::feedback.case }}</a>\n      </td>\n      <td>{{ ::(feedback.issue|constantByValue:FEEDBACK_ISSUE).text }}</td>\n      <td>{{ ::feedback.comment }}</td>\n      <td>\n        <div class=\"ToggleGroup\">\n          <button class=\"ToggleGroup-option\" name=\"justify-{{ ::feedback.case }}\" ng-click=\"setJustified(feedback, true)\" ng-class=\"{'is-selected': feedback.justified, 'is-deselected': !feedback.justified}\">Yes</button>\n          <button class=\"ToggleGroup-option\" name=\"unjustify-{{ ::feedback.case }}\" ng-click=\"setJustified(feedback, false)\" ng-class=\"{'is-selected': !feedback.justified, 'is-deselected': feedback.justified}\">No</button>\n        </div>\n      </td>\n      <td>\n        <timestamp ng-model=\"feedback.created\"></timestamp>\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/historic_case_detail.html',
        "<header class=\"CaseBar Grid\" hl-sticky=\"\" use-placeholder>\n  <div class=\"Grid-row\">\n    <div class=\"Grid-col Grid-col--1-5\">\n      <h1 class=\"CaseBar-caseNum Icon Icon--folder\">\n        {{ ::historicCase.laa_reference }}\n      </h1>\n    </div>\n  </div>\n</header>\n\n<div class=\"Grid\">\n  <div class=\"Grid-row\">\n    <div class=\"Grid-col Grid-col--1-5\">\n      <nav class=\"SubNav\">\n        <a ui-sref=\"historic_list(caseListStateParams)\" class=\"SubNav-link SubNav-link--back\">Back to cases</a>\n      </nav>\n      <div ui-view=\"personalDetails\"></div>\n    </div>\n\n    <div class=\"Grid-col Grid-col--3-5\" ui-view full-height data-centre-col>\n      <header class=\"PageHeader\">\n        <h1>Historical case (Capita)</h1>\n      </header>\n\n      <div class=\"ContactBlock ContactBlock--grey clearfix\">\n        <header ng-if=\"::historicCase.specialist_referred_to\">\n          <p class=\"u-compact u-mute\">Referred to</p>\n          <h2 class=\"ContactBlock-heading\">{{ ::historicCase.specialist_referred_to }}</h2>\n        </header>\n\n        <h2 class=\"ContactBlock-heading\" ng-if=\"!::historicCase.specialist_referred_to\">Not referred to specialist</h2>\n\n        <div class=\"Grid\">\n          <p ng-if=\"::historicCase.knowledgebase_items_used\" class=\"Grid-row\">\n            <strong class=\"Grid-col Grid-col--1-3\">Knowledge base</strong>\n            <span class=\"Grid-col Grid-col--2-3\">{{ ::historicCase.knowledgebase_items_used }}</span>\n          </p>\n\n          <p ng-if=\"::historicCase.date_specialist_referred\" class=\"Grid-row\">\n            <strong class=\"Grid-col Grid-col--1-3\">Date assigned</strong>\n            <span class=\"Grid-col Grid-col--2-3\">{{ ::historicCase.date_specialist_referred | dob }}</span>\n          </p>\n\n          <p ng-if=\"::historicCase.area_of_law\" class=\"Grid-row\">\n            <strong class=\"Grid-col Grid-col--1-3\">Area of Law</strong>\n            <span class=\"Grid-col Grid-col--2-3\">{{ ::historicCase.area_of_law }}</span>\n          </p>\n\n          <p class=\"Grid-row\">\n            <strong class=\"Grid-col Grid-col--1-3\">In scope</strong>\n            <span class=\"Grid-col Grid-col--2-3\">{{ ::historicCase.in_scope ? 'Yes' : 'No' }}</span>\n          </p>\n\n          <p class=\"Grid-row\">\n            <strong class=\"Grid-col Grid-col--1-3\">Financially eligible</strong>\n            <span class=\"Grid-col Grid-col--2-3\">{{ ::historicCase.financially_eligible ? 'Yes' : 'No' }}</span>\n          </p>\n        </div>\n      </div>\n\n    </div>\n\n    <div class=\"Grid-col Grid-col--1-5 Grid-col--bg-colour Guidance-buffer\">\n      <div class=\"Grid-colInner\" data-block=\"rh-col\">\n        <div ui-view=\"outcome\">\n          <div ui-view=\"outcome\"></div>\n          <ul class=\"CaseHistory\">\n            <li class=\"CaseHistory-card\">\n              <span>\n                <timestamp ng-model=\"historicCase.outcome_code_date\"></timestamp>\n                (Capita Operator)\n              </span>\n              <ul class=\"CaseHistory-log\">\n                <li class=\"CaseHistory-logItem cf\">\n                  <span class=\"CaseHistory-label\">{{ ::historicCase.outcome_code }}</span>\n                </li>\n              </ul>\n            </li>\n          </ul>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/historic_case_detail.personal_details.html',
        "<section id=\"personal_details\">\n\n  <div class=\"VCard VCard-view\">\n    <h2 class=\"VCard-title Icon Icon--formRow Icon--user\">{{ historicCase.full_name }}</h2>\n\n    <div class=\"VCard-row Icon Icon--row Icon--location\" ng-if=\"historicCase.postcode\">\n      <p class=\"u-compact\" ng-if=\"historicCase.postcode\">{{ historicCase.postcode }}</p>\n    </div>\n\n    <p class=\"VCard-row Icon Icon--row Icon--dob\" ng-if=\"historicCase.date_of_birth\">\n      {{ historicCase.date_of_birth | dob }} (Age {{ historicCase.date_of_birth | ageFromDate }})\n    </p>\n  </div>\n\n</section>\n\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/historic_case_list.html',
        "<header class=\"PageHeader PageHeader--withNav cf\">\n  <nav class=\"SubNav\">\n    <a ui-sref=\"case_list(caseListStateParams)\" class=\"SubNav-link SubNav-link--back\">Back to cases</a>\n  </nav>\n\n  <h1 data-block=\"title\">Historic Cases</h1>\n\n  <nav class=\"Filters\">\n    <a class=\"Label is-selected is-removable\" ng-if=\"search\" ui-sref=\"case_list\">\"{{ ::search }}\"</a>\n    <span data-block=\"filters\"></span>\n  </nav>\n</header>\n\n\n<table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n  <thead>\n    <tr>\n      <th>Case Reference</th>\n      <th>Name</th>\n      <th>Postcode</th>\n      <th>Date of Birth</th>\n      <th>Area of Law</th>\n      <th>Modified</th>\n      <th>Last outcome</th>\n    </tr>\n  </thead>\n\n  <tbody>\n    <tr dir-paginate=\"case in historicCases.results | itemsPerPage: 20\"\n        total-items=\"historicCases.count\" current-page=\"currentPage\">\n      <td>\n        <a href=\"\" ui-sref=\"historic_case_detail({reference: case.laa_reference})\">{{ ::case.laa_reference }}</a>\n      </td>\n      <td>\n        {{ ::case.full_name }}\n      </td>\n      <td>{{ ::case.postcode }}</td>\n      <td>{{ ::case.date_of_birth| dob }}</td>\n      <td>{{ ::case.area_of_law }}</td>\n      <td>\n        <timestamp ng-model=\"case.outcome_code_date\"></timestamp>\n      </td>\n      <td><span class=\"Label Label--secondary\" ng-if=\"case.outcome_code\">{{ ::case.outcome_code }}</span></td>\n    </tr>\n  </tbody>\n</table>\n\n<dir-pagination-controls on-page-change=\"pageChanged(newPageNumber)\"></dir-pagination-controls>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/user_list.html',
        "<div data-extend-template=\"user_list.html\">\n  <div data-block=\"title\" ng-include=\"'call_centre/includes/case_tab_navigation.html'\"></div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callScript.html',
        "<div class=\"ScriptBlock\" ng-if=\"$root.showCallScript\" ng-transclude></div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callScriptToggle.html',
        "<button class=\"ToggleButton ToggleButton--light-blue Icon Icon--script u-pullRight\" ng-class=\"{'is-selected': $root.showCallScript}\" ng-click=\"toggle()\" name=\"toggle-call-script\" title=\"Click to {{ state() == 'off' && 'display' || 'hide' }} call scripts\">Call scripts {{ state() }}</button>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callbackButton.html',
        "<button name=\"callback\" ng-click=\"bookCallback($event)\" class=\"BtnGroup-button BtnGroup-button--light\" title=\"Schedule a callback\" ng-transclude></button>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callbackMatrix.html',
        "<div class=\"Grid\">\n  <div class=\"Grid-row\">\n    <div class=\"Grid-col Grid-col--1-2\">\n      <table cellpadding=\"0\" cellspacing=\"4\" border=\"0\" width=\"100%\" class=\"CallbackMatrix\">\n        <thead>\n          <th width=\"10%\"></th>\n          <th ng-repeat=\"day in ::days\" class=\"CallbackMatrix-th{{ ::getCellClass(day) }}\" width=\"{{ 90 / days.length}}%\">{{ ::day.text }}</th>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"time in ::times\">\n            <th class=\"CallbackMatrix-th\" align=\"right\">{{ ::time.text }}</th>\n            <td\n              ng-repeat=\"day in ::days\"\n              class=\"CallbackMatrix-cell{{ ::getCellClass(day, time) }}\">\n              <callback-matrix-slot class=\"CallbackMatrix-slot\" colours=\"::colours\" callback-slot=\"::getSlot(day.day, time.hour)\" ng-click=\"showSlotCases($event, day.day, time.hour)\"></callback-matrix-slot>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td></td>\n            <td class=\"CallbackMatrix-total\" ng-repeat=\"day in ::days\">{{ ::getDayTotal(day.day) }}</td>\n          </tr>\n          <tr>\n            <td></td>\n            <td colspan=\"{{ ::days.length }}\">\n              <div class=\"CallbackMatrix-legend cf\">\n                <span class=\"CallbackMatrix-legendItem\" ng-repeat=\"colour in ::colours\">\n                  <span class=\"CallbackMatrix-density CallbackMatrix-density--{{ ::colour.suffix }}\"></span>\n                  {{ ::colour.text }}\n                </span>\n              </div>\n            </td>\n          </tr>\n        </tfoot>\n      </table>\n\n    </div>\n    <div class=\"Grid-col Grid-col--1-2\">\n      <p class=\"CallbackMatrix-placeholder\" ng-hide=\"slotsCases.length > 0\">Select a timeslot from the grid to see cases scheduled for that hour.</p>\n\n      <table class=\"ListTable\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" ng-show=\"slotsCases.length > 0\">\n        <thead>\n          <tr>\n            <th width=\"5%\"></th>\n            <th width=\"35%\">Case</th>\n            <th width=\"35%\">Name</th>\n            <th width=\"15%\">Time</th>\n            <th width=\"10%\"></th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"case in slotsCases\">\n            <td>\n              <abbr title=\"{{ ::case.source }} CASE\" class=\"Icon {{ ::$parent.$parent.opCaseClass(case) }}\"></abbr>\n            </td>\n            <td>\n              <a href=\"\" ng-click=\"$parent.goToCase(case.reference)\">{{ ::case.reference }}</a>\n              <span ng-if=\"case.isInScopeAndEligible()\"> / {{ ::case.laa_reference }}</span>\n            </td>\n            <td>\n              <span data-block=\"pd-column\">{{ ::case.full_name }}</span>\n            </td>\n            <td>{{ ::case.requires_action_at | date:\"h:mma\" }}</td>\n            <td>\n              <span class=\"Label Label--secondary\" ng-if=\"case.outcome_code\">{{ ::case.outcome_code }}</span>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callbackMatrixSlot.html',
        "<a href=\"\" ng-mouseover=\"showTip=true\" ng-mouseleave=\"showTip=false\">\n  <span class=\"Tooltip\" ng-show=\"showTip\">\n    <strong>{{ ::slot.value }} call{{ ::slot.value > 1 ? 's' : '' }}</strong> scheduled between {{ ::slotTimeStart }} and {{ ::slotTimeEnd }} on {{ ::day }}\n  </span>\n</a>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callbackModal.html',
        "<div class=\"CallbackModal-wrapper\">\n  <form name=\"callback_form\" class=\"CallbackModal\" ng-show=\"isVisible\" ng-submit=\"bookCallback(callback_form)\">\n    <header>\n      <h2 class=\"CallbackModal-heading\">{{ ::callbackTitle }}</h2>\n    </header>\n\n    <div ng-hide=\"!canBeCalledBack\">\n      <nav class=\"CallbackModal-daySelect\">\n        <button name=\"set-today\" class=\"Button Button--secondary\" type=\"button\" ng-click=\"setToday($event)\">Today</button>\n        <button name=\"set-tomorrow\" class=\"Button Button--secondary\" type=\"button\" ng-click=\"setTomorrow($event)\">Tomorrow</button>\n      </nav>\n\n      <span class=\"Error-message\" ng-if=\"errors.datetime\">{{ errors.datetime }}</span>\n      <div datetime-picker picker-Config=\"datePickerConf\"></div>\n\n      <div class=\"CallbackModal-priority\">\n        <label>\n          <input type=\"checkbox\" ng-model=\"::priorityCallback\"> Priority callback\n        </label>\n      </div>\n\n      <div class=\"FormRow cf\">\n        <label>\n          <span class=\"Error-message\" ng-if=\"(callback_frm.callbackNotes.$error.required||errors.notes) && callback_frm.$dirty\">{{ errors.notes }}</span>\n          <textarea class=\"FormRow-field--full\" cols=\"20\" rows=\"5\" name=\"callbackNotes\" ng-model=\"::callbackNotes\" placeholder=\"Comments\" server-error></textarea>\n        </label>\n      </div>\n    </div>\n\n    <div ng-show=\"!canBeCalledBack\">\n      <p>You can't schedule a new callback as you have already tried to reach the client three times.</p>\n    </div>\n\n    <div class=\"FormActions\">\n      <button class=\"Button\" type=\"submit\" ng-if=\"canBeCalledBack\">Schedule</button>\n      <button class=\"Button {{ canBeCalledBack ? 'Button--secondary' : '' }}\" type=\"button\" ng-if=\"case.getCallbackDatetime()\" ng-really-message=\"This action will cancel the callback with a CBC outcome code and suspend the Case. Do you wish to continue?\" ng-really-click=\"cancelCallback()\">Stop callback</button>\n      <a href=\"\" ng-click=\"close()\">Cancel</a>\n    </div>\n  </form>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/callbackStatus.html',
        "<div class=\"Notice Notice--secondary ng-cloak\">\n  <p>Callback scheduled for {{ ::time }}</p>\n\n  <p ng-if=\"!case.callStarted()\"><button class=\"Button\" type=\"button\" ng-really-message=\"This action will start your call. It cannot be undone. Do you wish to continue?\" ng-really-click=\"startCall()\">Start call</button></p>\n\n  <p><a href=\"\" ng-really-message=\"Please only use this action if you managed to speak with the client. If you want to reschedule or cancel the callback use the 'Schedule callback' button instead. Do you wish to continue?\" ng-really-click=\"completeCallback()\">Remove callback</a></p>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/copyUserAddress.html',
        "<p class=\"FormRow FormRow--narrow\">\n  <a href=\"\" class=\"Icon--formRow\" ng-click=\"copyAddress()\">Use same address as client</a>\n</p>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/csvUpload.html',
        "<div class=\"Error\" ng-if=\"errors.length || global_error\">\n    <span ng-if=\"global_error\">{{ global_error.reason }}</span>\n    <div ng-repeat=\"error in errors\">\n      Row: {{ error.row }} - {{ error.message }}\n    </div>\n</div>\n<label>\n  <span class=\"visuallyhidden\">File</span>\n\n  <input type=\"file\" name=\"csvfile\" accept=\"text/csv\" required=\"required\">\n</label>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/feedbackPopover.html',
        "<div class=\"FeedbackPopover\" ng-show=\"isPopoverVisible\">\n  <h2 class=\"FeedbackPopover-heading\">Send your feedback</h2>\n  <form ng-submit=\"submit(feedback_frm)\" name=\"feedback_frm\">\n    <span class=\"Error-message\" ng-if=\"feedback_frm.$error.server\">\n      There was a problem sending your feedback. Please try again later.\n    </span>\n\n    <div class=\"FormRow cf\">\n      <label for=\"id_feedback-type\" class=\"visuallyhidden\">Type of feedback</label>\n      <select id=\"id_feedback-type\" ng-model=\"feedbackType\" ng-options=\"option for option in feedbackTypes\"></select>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label for=\"id_comments\" class=\"visuallyhidden\">Your comment</label>\n      <textarea name=\"comments\" id=\"id_comments\" cols=\"30\" rows=\"10\" ng-model=\"comments\" placeholder=\"Your feedback\" required></textarea>\n    </div>\n\n    <div class=\"FormActions\">\n      <button type=\"submit\" name=\"send-feedback\" class=\"Button\">Send feedback</button>\n      <a href=\"\" ng-click=\"close()\">Cancel</a>\n    </div>\n  </form>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/flashMessages.html',
        "<ul class=\"Notice-group\" ng-if=\"messages\">\n  <li ng-repeat=\"m in messages\" ng-if=\"$last\" class=\"Notice Notice--closeable {{levelClassName(m.level)}}\" ng-click=\"hide(m)\" ng-bind-html=\"m.text\"></li>\n</ul>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/form.warning.html',
        "<ul>\n  <li ng-repeat=\"warning in warnings_for\">\n    {{ warning }}\n  </li>\n  <li ng-repeat=\"error in errors_for\">\n    {{ error }}\n  </li>\n</ul>");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/guidance.html',
        "<div class=\"Guidance-searchContainer\">\n  <form ng-submit=\"search()\" class=\"Guidance-search\">\n    <div class=\"FormRow cf\">\n      <input type=\"text\" name=\"query\" placeholder=\"Search guidance\" ng-model=\"guidance.query\" class=\"Guidance-query FormRow-field--full\" ng-focus=\"toggleResults(true)\" autocomplete=\"off\" />\n      <button class=\"Search-submit\" type=\"submit\">Search</button>\n    </div>\n  </form>\n\n  <div class=\"Guidance-resultContainer\" ng-if=\"show_results\">\n    <ul class=\"Guidance-results\" ng-if=\"results.length > 0\">\n      <li class=\"Guidance-resultItem\" ng-repeat=\"result in results\">\n        <a href=\"\" ng-click=\"addDoc(result.name)\">{{ result.title }}</a>\n      </li>\n    </ul>\n    <p class=\"Guidance-noResults\" ng-if=\"no_results\">There are no guidance documents matching your query</p>\n  </div>\n</div>\n\n<guidance-item content=\"htmlDoc\" ref=\"docRef\"></guidance-item>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/guidance.inline_link.html',
        "<a href=\"\" ng-click=\"openGuidance()\" class=\"Icon Icon--right Icon--info\"></a>");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/guidance.tab.html',
        "<div class=\"Guidance-tab\" ng-if=\"content\" ng-class=\"{'is-minimised': minimise}\">\n  <a href=\"\" ng-click=\"closeDoc()\" class=\"Guidance-tabClose\">x</a>\n  <a href=\"\" ng-click=\"minimise=!minimise\" class=\"Guidance-tabMinMax\">_</a>\n  <h1 class=\"Guidance-tabHeading\" ng-if=\"minimise\" ng-click=\"minimise=!minimise\">Guidance (1)</h1>\n  <div class=\"Guidance-tabContent\" ng-bind-html=\"content\"></div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/money_interval.html',
        "<label>\n  <span class=\"FormRow-label\">\n    <span ng-bind-html=\"miLabel\"></span> <guidance-link doc=\"{{guidanceLink}}\" ng-if=\"guidanceLink\"></guidance-link>\n  </span>\n\n  <span class=\"FormRow-prefix\">£</span>\n\n  <input cla-pence-to-pounds max=\"2500000\" min=\"0\" step=\"0.01\" type=\"number\" ng-model=\"per_interval_value\" name=\"{{ name }}\">\n\n  <select class=\"FormRow-field--interval\" ng-model=\"interval_period\">\n    <option value=\"per_week\">per week</option>\n    <option value=\"per_2week\">2 weekly</option>\n    <option value=\"per_4week\">4 weekly</option>\n    <option value=\"per_month\">per month</option>\n    <option value=\"per_year\">per year</option>\n  </select>\n</label>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/notes_form.html',
        "<form method=\"post\" ng-submit=\"save()\" name=\"notesFrm\">\n  <div class=\"FormRow cf Notes\" ng-class=\"{'Error': notesFrm.notes.$invalid}\">\n    <a href=\"\" notes-history=\"{{ case.reference }}\" history-type=\"{{ type }}\" summary=\"true\" class=\"Notes-history\" title=\"View case notes history\"></a>\n\n    <!-- error messages -->\n    <ul class=\"ErrorSummary-list\" ng-messages=\"notesFrm.notes.$error\">\n      <li class=\"ErrorSummary-listItem\" ng-message=\"server\">{{ errors.notes }}</li>\n      <li class=\"ErrorSummary-listItem\" ng-message=\"maxlength\">This field is limited to 10000 characters</li>\n    </ul>\n\n    <label class=\"cf\">\n      <span class=\"visuallyhidden\">Case Notes</span>\n      <textarea class=\"FormRow-field--full\" name=\"{{ ref }}\" placeholder=\"Comments about this case\" cols=\"20\" rows=\"10\" ng-model=\"::model\" ng-maxlength=\"10000\" server-error></textarea>\n    </label>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/notifications.html',
        "<div class=\"NotificationsContainer\" ng-if=\"notifications.length\">\n  <ul>\n    <li class=\"Notification-notificationItem-{{ notification.type }}\"\n        ng-repeat=\"notification in notifications\">\n      {{ notification.notification }}\n    </li>\n  </ul>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/outcomeFeedback.html',
        "<div class=\"FormRow cf\" ng-hide=\"shouldLeaveFeedback()\">\n  <button type=\"button\" class=\"Button Button--secondary Button--add\" ng-click=\"showFeedback=true\" name=\"add-feedback\">Add feedback</button>\n</div>\n\n<div class=\"FormRow cf\" ng-show=\"shouldLeaveFeedback()\">\n  <span class=\"Error-message\" ng-show=\"form.reject_feedback_issue.$error.required && submitted\">Feedback is required for this outcome code</span>\n  <select\n    id=\"reject_feedback_issue\"\n    ng-model=\"issue\"\n    name=\"reject_feedback_issue\"\n    ui-select2=\"{allowClear: true}\"\n    placeholder=\"Choose feedback reason\"\n    ng-options=\"s.value as s.text for s in issues track by s.value\"\n    ng-required=\"shouldLeaveFeedback() && !showFeedback\">\n      <option value=\"\"></option>\n  </select>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/safe_to_contact.html',
        "<div class=\"SafeToContact\">\n  <a href=\"\" class=\"Icon\" ng-click=\"showOpts=!showOpts\" ng-class=\"iconClass()\"></a>\n  <div class=\"SafeToContact-content\" ng-if=\"showOpts\">\n    <ul class=\"SafeToContact-list\">\n      <li class=\"SafeToContact-listItem\" ng-repeat=\"opt in options\">\n        <a href=\"\" class=\"SafeToContact-option Icon\" ng-click=\"setSafe(opt.name)\" ng-class=\"{'is-selected': person.safe_to_contact === opt.value, 'Icon--call Icon--green': opt.value === 'SAFE', 'Icon--dontcall Icon--red': opt.value === 'DONT_CALL', 'Icon--novoicemail Icon--red': opt.value === 'NO_MESSAGE'}\">{{ opt.name }}</a>\n      </li>\n    </ul>\n  </div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/systemMessage.html',
        "<p class=\"Notice Notice--system\" role=\"alert\" ng-class=\"{'Notice--closeable': isCloseable}\" ng-if=\"message\" ng-click=\"clearMessage()\" ng-bind-html=\"message\"></p>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/three_part_date_input.html',
        "<input name=\"dob_day\" type=\"text\" ng-model=\"model.day\" class=\"FormRow-field--xs FormRow-field--inline\" placeholder=\"DD\" maxlength=\"2\" ng-pattern=\"/^[0-9]{1,2}$/\"></span>\n<input name=\"dob_month\" type=\"text\" ng-model=\"model.month\" class=\"FormRow-field--xs FormRow-field--inline\" placeholder=\"MM\" maxlength=\"2\" ng-pattern=\"/^[0-9]{1,2}$/\"></span>\n<input name=\"dob_year\" type=\"text\" ng-model=\"model.year\" class=\"FormRow-field--s FormRow-field--inline\" placeholder=\"YYYY\" maxlength=\"4\" ng-pattern=\"/^[0-9]{4}$/\"></span>");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/timer.html',
        "<div class=\"Timer\" ng-show=\"isEnabled\" ng-class=\"{'is-unstarted': timer.running === false, 'is-hovered': hover}\" ng-mouseover=\"hover=true\" ng-mouseleave=\"hover=false\" ng-click=\"toggleTimer(startButton)\" title=\"Case timer\">\n  <span class=\"Timer-warning\" ng-if=\"startButton && timer.running === false\"><i class=\"Icon Icon--alert Icon--orange\"></i>Timer not running</span class=\"Timer-warning\">\n  <i class=\"Timer-icon\" ng-if=\"startButton\"></i>\n  <span class=\"Timer-value\">{{ timer.value }}</span>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/timestamp.html',
        "<abbr title=\"{{ ::formattedDate }}\" am-time-ago=\"date\"></abbr>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/address_finder.modal.html',
        "<form name=\"frmAddressFinder\" autocomplete=\"off\" novalidate ng-submit=\"setAddress(frmAddressFinder.$valid)\">\n  <header>\n    <h2>Address search</h2>\n    <p><strong>{{ ::addresses.length }} address{{ ::suffix }}</strong> were found for {{ ::postcode }}.</p>\n  </header>\n\n  <div class=\"FormBlock FormBlock--grey\" ng-if=\"::addresses.length > 0\">\n    <div>\n      <div class=\"FormRow cf\">\n        <input type=\"text\" id=\"addressSearch\" name=\"address-finder-search\" placeholder=\"Search addresses\" class=\"FormRow-field--l\" ng-model=\"::address_search\" search-filter ng-change=\"singleAddr(address_search)\">\n      </div>\n\n      <div class=\"FormRow FormRow--group FormRow--groupNarrow\" ng-repeat=\"address in addresses | filter:address_search\">\n        <label class=\"FormRow-label\">\n          <input type=\"radio\" name=\"address_results\" value=\"{{ ::address.formatted_address }}\" ng-model=\"::selected.address\" required>\n          {{ ::formatAddress(address.formatted_address) }}\n        </label>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"Error Error--basic\" ng-show=\"frmAddressFinder.$submitted && frmAddressFinder.address_results.$error.required\">\n    <p>Please select an address to populate the card</p>\n  </div>\n\n  <div class=\"FormActions\">\n    <button type=\"submit\" name=\"select-address\" class=\"Button\" ng-if=\"::addresses.length > 0\">Use address</button>\n    <button type=\"button\" name=\"cancel-address\" class=\"Button Button--text\" ng-click=\"close()\">Cancel</button>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/diagnosis.summary.modal.html',
        "<h2 ng-class=\"diagnosisTitleClass()\">{{ diagnosisTitle() }}</h2>\n\n<section class=\"SummaryBlock SummaryBlock--compact\" ng-if=\"diagnosis.nodes\">\n  <div class=\"SummaryBlock-content\" ng-repeat=\"statement in diagnosis.nodes\" ng-bind-html=\"statement.label\"></div>\n</section>\n\n<div class=\"FormActions\">\n  <a href=\"\" ng-click=\"close()\">Close</a>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/eligibility.details.html',
        "<!-- NASS Benefits are always set to FALSE for operator cases -->\n<input type=\"hidden\" name=\"your_details-nass_benefits\" ng-model=\"::eligibility_check.on_nass_benefits\">\n\n<call-script>\n  <p>From the information you have given today we may be able to put you through to a specialist provider who could help you with this area of law.</p>\n  <p>Before I can transfer you we need to complete a short financial assessment to see if you can get Legal Aid. Do you have financial information to hand?</p>\n  <p>You may need details of:</p>\n  <ul>\n    <li>income (pay slips)</li>\n    <li>benefits</li>\n    <li>housing costs</li>\n    <li>property value</li>\n    <li>expenses (bank statement)</li>\n  </ul>\n</call-script>\n\n<h2 class=\"FormBlock-label\">About you</h2>\n<section class=\"FormBlock FormBlock--grey\">\n  <div class=\"FormRow cf\">\n    <p class=\"FormRow-label\">Do you have a partner? <guidance-link doc=\"eligibility_check/#ecg-has_partner\"></guidance-link></p>\n\n    <label for=\"id_your_details-has_partner_0\" class=\"FormRow-option FormRow-option--inline\">\n      <input type=\"radio\" name=\"your_details-has_partner\" id=\"id_your_details-has_partner_0\" ng-value=\"true\" ng-model=\"::eligibility_check.has_partner\">Yes\n    </label>\n\n    <label for=\"id_your_details-has_partner_1\" class=\"FormRow-option FormRow-option--inline\">\n      <input type=\"radio\" name=\"your_details-has_partner\" id=\"id_your_details-has_partner_1\" ng-value=\"false\" ng-model=\"::eligibility_check.has_partner\">No\n    </label>\n  </div>\n\n  <div class=\"FormRow cf\">\n    <p class=\"FormRow-label\">Are you<span ng-show=\"hasPartner()\"> or your partner</span> aged 60 or over? <guidance-link doc=\"eligibility_check/#ecg-over_60\"></guidance-link></p>\n\n    <label for=\"id_your_details-older_than_sixty_0\" class=\"FormRow-option FormRow-option--inline\">\n      <input type=\"radio\" name=\"your_details-older_than_sixty\" id=\"id_your_details-older_than_sixty_0\" ng-value=\"true\" ng-model=\"::eligibility_check.is_you_or_your_partner_over_60\">Yes\n    </label>\n\n    <label for=\"id_your_details-older_than_sixty_1\" class=\"FormRow-option FormRow-option--inline\">\n      <input type=\"radio\" name=\"your_details-older_than_sixty\" id=\"id_your_details-older_than_sixty_1\" ng-value=\"false\" ng-model=\"::eligibility_check.is_you_or_your_partner_over_60\">No\n    </label>\n  </div>\n</section>\n\n<h2 class=\"FormBlock-label\">Benefits</h2>\n<call-script ng-if=\"::hasSpecificBenefits()\">\n  <p>I am now going to read through a list of benefits. Could you please tell me if you<span ng-show=\"hasPartner()\"> or your partner</span> receive any of these.</p>\n</call-script>\n<section class=\"FormBlock FormBlock--grey\" ng-switch on=\"::hasSpecificBenefits()\">\n  <div class=\"FormRow cf\" ng-switch-when=\"true\" ng-repeat=\"opt in ::specificBenefitsOptions\">\n    <p class=\"FormRow-label\">{{ ::opt.text }}</p>\n\n    <label class=\"FormRow-option FormRow-option--inline\">\n      <input type=\"radio\" name=\"your_details-specific_benefits-{{::opt.value}}\" ng-value=\"true\" ng-model=\"::eligibility_check.specific_benefits[opt.value]\" ng-change=\"benefitChange()\">Yes\n    </label>\n\n    <label class=\"FormRow-option FormRow-option--inline\">\n      <input type=\"radio\" name=\"your_details-specific_benefits-{{::opt.value}}\" ng-value=\"false\" ng-model=\"::eligibility_check.specific_benefits[opt.value]\" ng-change=\"benefitChange()\">No\n    </label>\n  </div>\n  <div ng-switch-default>\n    <div class=\"FormRow cf Grid\">\n      <div class=\"FormRow-label\">\n        <p class=\"u-compact\">I am now going to read through a list of benefits. Could you please tell me if you<span ng-show=\"hasPartner()\" class=\"ng-hide\"> or your partner</span> receive any of these:</p>\n        <ul>\n          <li>Universal Credit</li>\n          <li>Income Support</li>\n          <li>Income based Job Seekers Allowance</li>\n          <li>Guarantee State Pension Credit</li>\n          <li>Income Based Employment and Support Allowance</li>\n        </ul>\n      </div>\n\n      <label for=\"id_your_details-passported_benefits_0\" class=\"FormRow-option FormRow-option--inline\">\n        <input type=\"radio\" name=\"your_details-passported_benefits\" id=\"id_your_details-passported_benefits_0\" ng-value=\"true\" ng-model=\"::eligibility_check.on_passported_benefits\" ng-click=\"updateTabs()\" class=\"ng-pristine ng-untouched ng-valid\">Yes\n      </label>\n\n      <label for=\"id_your_details-passported_benefits_1\" class=\"FormRow-option FormRow-option--inline\">\n        <input type=\"radio\" name=\"your_details-passported_benefits\" id=\"id_your_details-passported_benefits_1\" ng-value=\"false\" ng-model=\"::eligibility_check.on_passported_benefits\" ng-click=\"updateTabs()\" class=\"ng-pristine ng-untouched ng-valid\">No\n      </label>\n    </div>\n  </div>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/eligibility.expenses.html',
        "<call-script>\n  <p>We will now look at your expenses for the last calendar month. This runs from today back to {{ oneMonthAgo }}</p>\n</call-script>\n\n<section data-fieldset=\"your-expenses\">\n  <h2 class=\"FormBlock-label\">Your expenses</h2>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.deductions.mortgage\" mi-label=\"How much do you pay for your mortgage?\" guidance-link=\"'eligibility_check/#ecg-expenses_mortgage'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.deductions.rent\" mi-label=\"How much do you pay for rent? The amount entered should not include any housing benefit or payments for bills.\" guidance-link=\"'eligibility_check/#ecg-expenses_rent'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.deductions.maintenance\" mi-label=\"How much maintenance have you paid during the last calendar month (today back to {{ oneMonthAgo }})?\" guidance-link=\"'eligibility_check/#ecg-expenses_maintenance'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.deductions.childcare\" mi-label=\"Do you have any childcare costs because of work or study? If so, how much?\" guidance-link=\"'eligibility_check/#ecg-expenses_childcare'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\">\n        <span class=\"FormRow-label\">Are you currently paying towards legal aid for criminal defence? If so, how much have you paid during the last calendar month (today back to {{ oneMonthAgo }})? <guidance-link doc=\"eligibility_check/#ecg-expenses_contribution_order\"></guidance-link></span>\n\n        <span class=\"FormRow-prefix\">£</span>\n\n        <input cla-pence-to-pounds max=\"2500000\" min=\"0\" step=\"0.01\" type=\"number\" ng-model=\"eligibility_check.you.deductions.criminal_legalaid_contributions\">\n\n        <span class=\"FormRow-help\">per month</span>\n      </label>\n    </div>\n  </div>\n</section>\n\n<section data-fieldset=\"partner-expenses\" ng-show=\"hasPartner()\">\n  <h2 class=\"FormBlock-label\">Your partner's expenses</h2>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.deductions.mortgage\" mi-label=\"How much does your partner pay for their mortgage?\" guidance-link=\"'eligibility_check/#ecg-expenses_mortgage'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.deductions.rent\" mi-label=\"How much does your partner pay for rent excluding housing benefit?\" guidance-link=\"'eligibility_check/#ecg-expenses_rent'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.deductions.maintenance\" mi-label=\"How much maintenance has your partner paid during the last calendar month (today back to {{ oneMonthAgo }})?\" guidance-link=\"'eligibility_check/#ecg-expenses_maintenance'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.deductions.childcare\" mi-label=\"Does your partner have any childcare costs because of work or study? If so, how much?\" guidance-link=\"'eligibility_check/#ecg-expenses_childcare'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\">\n        <span class=\"FormRow-label\">Is your partner currently paying towards legal aid for criminal defence? If so, how much have they paid during the last calendar month (today back to {{ oneMonthAgo }})? <guidance-link doc=\"eligibility_check/#ecg-expenses_contribution_order\"></guidance-link></span>\n\n        <span class=\"FormRow-prefix\">£</span>\n\n        <input cla-pence-to-pounds max=\"2500000\" min=\"0\" step=\"0.01\" type=\"number\" ng-model=\"eligibility_check.partner.deductions.criminal_legalaid_contributions\">\n\n        <span class=\"FormRow-help\">per month</span>\n      </label>\n    </div>\n  </div>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/eligibility.finances.html',
        "<call-script>\n  <p>We will now look at your savings for the last calendar month. This runs from today back to {{ oneMonthAgo }}.</p>\n</call-script>\n\n<section>\n  <div ng-show=\"!eligibility_check.property_set || eligibility_check.property_set.length === 0\">\n    <h2 class=\"FormBlock-label\">Your property (only for homeowners)</h2>\n\n    <p class=\"FormBlock FormBlock--grey\">\n      No properties have been added\n    </p>\n  </div>\n\n  <div ng-repeat=\"property in eligibility_check.property_set\">\n    <div class=\"clearfix\">\n      <h2 class=\"FormBlock-label FormBlock-label--inline\">{{ $index+1 | ordinal }} property</h2>\n      <button class=\"Button--text\" type=\"button\" value=\"remove-property\" ng-click=\"removeProperty($index)\">Remove property</button>\n    </div>\n\n    <div class=\"FormBlock FormBlock--grey\">\n      <div class=\"FormRow cf\">\n        <label>\n          <span class=\"FormRow-label\">What is the current market value of the property? <guidance-link doc=\"eligibility_check/#ecg-property_worth\"></guidance-link></span>\n          <span class=\"FormRow-prefix\">£</span>\n          <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"property.value\">\n        </label>\n      </div>\n\n      <div class=\"FormRow cf\">\n        <label>\n          <span class=\"FormRow-label\">How much is left to pay on the mortgage? <guidance-link doc=\"eligibility_check/#ecg-property_mortgage_left\"></guidance-link></span>\n          <span class=\"FormRow-prefix\">£</span>\n          <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"property.mortgage_left\">\n        </label>\n      </div>\n\n      <div class=\"FormRow cf\" ng-show=\"hasSMOD()\">\n        <p class=\"FormRow-label\">Is the property disputed? <guidance-link doc=\"eligibility_check/#ecg-property_disputed\"></guidance-link></p>\n\n        <label class=\"FormRow-option FormRow-option--inline\">\n          <input type=\"radio\" value=\"1\" name=\"property_disputed-{{ $index }}\" ng-model=\"property.disputed\">Yes\n        </label>\n\n        <label class=\"FormRow-option FormRow-option--inline\">\n          <input type=\"radio\" value=\"0\" name=\"property_disputed-{{ $index }}\" ng-model=\"property.disputed\">No\n        </label>\n      </div>\n\n      <div class=\"FormRow cf\">\n        <p class=\"FormRow-label\">Is this your main property? <guidance-link doc=\"eligibility_check/#ecg-property_main\"></guidance-link></p>\n\n        <label class=\"FormRow-option FormRow-option--inline\">\n          <input type=\"radio\" value=\"1\" name=\"property_main-{{ $index }}\" ng-model=\"property.main\">Yes\n        </label>\n\n        <label class=\"FormRow-option FormRow-option--inline\">\n          <input type=\"radio\" value=\"0\" name=\"property_main-{{ $index }}\" ng-model=\"property.main\">No\n        </label>\n      </div>\n\n      <div class=\"FormRow cf\">\n        <label>\n          <span class=\"FormRow-label\">What percentage of the property do you<span ng-show=\"hasPartner()\"> and/or your partner</span> own? <guidance-link doc=\"eligibility_check/#ecg-property_share\"></guidance-link></span>\n          <input class=\"FormRow-field--s\" max=\"100\" min=\"0\" type=\"number\" ng-model=\"property.share\">\n          <span class=\"FormRow-suffix\">%</span>\n        </label>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"FormBlock-actions\">\n    <a class=\"Button Button--secondary Button--add\" ng-click=\"addProperty()\">Add property</a>\n  </div>\n</section>\n\n<section>\n  <h2 class=\"FormBlock-label\">Your <span ng-show=\"hasSMOD()\">undisputed </span>savings <guidance-link doc=\"eligibility_check/#ecg-undisputed_savings\"></guidance-link></h2>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">How much was in your bank account/building society before your last payment went in? <guidance-link doc=\"eligibility_check/#ecg-savings_bank_balance\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.you.savings.bank_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Do you have any investments, shares or ISAs? <guidance-link doc=\"eligibility_check/#ecg-savings_investments\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.you.savings.investment_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Do you have any valuable items worth over £500 each? <guidance-link doc=\"eligibility_check/#ecg-savings_valuable_items\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.you.savings.asset_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Do you have any money owed to you? <guidance-link doc=\"eligibility_check/#ecg-savings_money_owned\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.you.savings.credit_balance\">\n      </label>\n    </div>\n  </div>\n</section>\n\n<section ng-show=\"hasPartner()\">\n  <h2 id=\"partners_savings-label\" class=\"FormBlock-label\">Your partner's <span ng-show=\"hasSMOD()\">undisputed </span>savings</h2>\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">How much was in your partner's bank account/building society before your last payment went in? <guidance-link doc=\"eligibility_check/#ecg-savings_bank_balance\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.partner.savings.bank_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Does your partner have any investments, shares or ISAs? <guidance-link doc=\"eligibility_check/#ecg-savings_investments\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.partner.savings.investment_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Does your partner have any valuable items worth over £500 each? <guidance-link doc=\"eligibility_check/#ecg-savings_valuable_items\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.partner.savings.asset_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Does your partner have any money owed to them? <guidance-link doc=\"eligibility_check/#ecg-savings_money_owned\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.partner.savings.credit_balance\">\n      </label>\n    </div>\n  </div>\n</section>\n\n<section ng-show=\"hasSMOD()\">\n  <h2 class=\"FormBlock-label\">Disputed savings <guidance-link doc=\"eligibility_check/#ecg-disputed_savings\"></guidance-link></h2>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">How much was in your bank account/building society before your last payment went in? <guidance-link doc=\"eligibility_check/#ecg-savings_bank_balance\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.disputed_savings.bank_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Do you have any investments, shares or ISAs? <guidance-link doc=\"eligibility_check/#ecg-savings_investments\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.disputed_savings.investment_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Do you have any valuable items worth over £500 each? <guidance-link doc=\"eligibility_check/#ecg-savings_valuable_items\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.disputed_savings.asset_balance\">\n      </label>\n    </div>\n\n    <div class=\"FormRow cf\">\n      <label>\n        <span class=\"FormRow-label\">Do you have any money owed to you? <guidance-link doc=\"eligibility_check/#ecg-savings_money_owned\"></guidance-link></span>\n        <span class=\"FormRow-prefix\">£</span>\n        <input max=\"9999999999\" min=\"0\" step=\"0.01\" type=\"number\" cla-pence-to-pounds ng-model=\"eligibility_check.disputed_savings.credit_balance\">\n      </label>\n    </div>\n  </div>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/eligibility.income.html',
        "<call-script>\n  <p>We will now look at your income for the last calendar month. This runs from today back to {{ oneMonthAgo }}.</p>\n</call-script>\n\n<section data-fieldset=\"your-income\">\n  <h2 class=\"FormBlock-label\">Your income</h2>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <p class=\"FormRow-label\">Are you self employed? <guidance-link doc=\"eligibility_check/#ecg-self_employed\"></guidance-link></p>\n\n      <label for=\"id_your_income-self_employed_0\" class=\"FormRow-option FormRow-option--inline\">\n        <input type=\"radio\" name=\"id_your_income-self_employed\" id=\"id_your_income-self_employed_0\" value=\"1\" ng-model=\"eligibility_check.you.income.self_employed\">Yes\n      </label>\n\n      <label for=\"id_your_income-self_employed_1\" class=\"FormRow-option FormRow-option--inline\">\n        <input type=\"radio\" name=\"id_your_income-self_employed\" id=\"id_your_income-self_employed_1\" value=\"0\" ng-model=\"eligibility_check.you.income.self_employed\">No\n      </label>\n    </div>\n  </div>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <nav class=\"FormRow\">\n      <a href=\"http://taxandnicalculator.co.uk/\" target=\"_blank\">Tax &amp; National Insurance calculator</a><br>\n      <a href=\"http://www.uktaxcalculators.co.uk/reverse-tax-calculator.php\" target=\"_blank\">Reverse tax calculator</a>\n    </nav>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.earnings\" mi-label=\"What did you earn before tax? (Check your most recent payslips)\" guidance-link=\"'eligibility_check/#ecg-earnings'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.deductions.income_tax\" mi-label=\"How much tax do you pay?\" guidance-link=\"'eligibility_check/#ecg-expenses_tax'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.deductions.national_insurance\" mi-label=\"How much National Insurance do you pay?\" guidance-link=\"'eligibility_check/#ecg-expenses_nic'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.self_employment_drawings\" mi-label=\"Self employed drawings (Before Tax)\" guidance-link=\"'eligibility_check/#ecg-se_drawings'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.benefits\" mi-label=\"Benefits\" guidance-link=\"'eligibility_check/#ecg-benefits'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.tax_credits\" mi-label=\"Tax credits\" guidance-link=\"'eligibility_check/#ecg-tax_credits'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.child_benefits\" mi-label=\"Child Benefit (for household)\" guidance-link=\"'eligibility_check/#ecg-child_benefits'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.maintenance_received\" mi-label=\"Maintenance received\" guidance-link=\"'eligibility_check/#ecg-maintenance_received'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.pension\" mi-label=\"Pension income\" guidance-link=\"'eligibility_check/#ecg-pension'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.you.income.other_income\" mi-label=\"Other income\" guidance-link=\"'eligibility_check/#ecg-other_income'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n  </div>\n</section>\n\n<section data-fieldset=\"partner-income\" ng-show=\"hasPartner()\">\n  <h2 class=\"FormBlock-label\">Your partner's income</h2>\n\n  <cla-server-validate data-for=\"partner.income\"></cla-server-validate>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <p class=\"FormRow-label\">Is your partner self employed? <guidance-link doc=\"eligibility_check/#ecg-self_employed\"></guidance-link></p>\n\n      <label for=\"id_partners_income-self_employed_0\" class=\"FormRow-option FormRow-option--inline\">\n        <input type=\"radio\" name=\"id_partners_income-self_employed\" id=\"id_partners_income-self_employed_0\" value=\"1\" ng-model=\"eligibility_check.partner.income.self_employed\">Yes\n      </label>\n\n      <label for=\"id_partners_income-self_employed_1\" class=\"FormRow-option FormRow-option--inline\">\n        <input type=\"radio\" name=\"id_partners_income-self_employed\" id=\"id_partners_income-self_employed_1\" value=\"0\" ng-model=\"eligibility_check.partner.income.self_employed\">No\n      </label>\n    </div>\n  </div>\n\n  <div class=\"FormBlock FormBlock--grey\">\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.earnings\" mi-label=\"What did your partner earn before tax? (Based on their most recent payslips)\" guidance-link=\"'eligibility_check/#ecg-earnings'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.deductions.income_tax\" mi-label=\"How much tax does your partner pay?\" guidance-link=\"'eligibility_check/#ecg-expenses_tax'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.deductions.national_insurance\" mi-label=\"How much National Insurance does your partner pay?\" guidance-link=\"'eligibility_check/#ecg-expenses_nic'\" ng-class=\"fieldWarningClass(['negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.self_employment_drawings\" mi-label=\"Self employed drawings (Before Tax)\" guidance-link=\"'eligibility_check/#ecg-se_drawings'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.benefits\" mi-label=\"Benefits\" guidance-link=\"'eligibility_check/#ecg-benefits'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.tax_credits\" mi-label=\"Tax credits\" guidance-link=\"'eligibility_check/#ecg-tax_credits'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.maintenance_received\" mi-label=\"Maintenance received\" guidance-link=\"'eligibility_check/#ecg-maintenance_received'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.pension\" mi-label=\"Pension income\" guidance-link=\"'eligibility_check/#ecg-pension'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n\n    <div class=\"FormRow cf\">\n      <money-interval ng-model=\"eligibility_check.partner.income.other_income\" mi-label=\"Other income\" guidance-link=\"'eligibility_check/#ecg-other_income'\" ng-class=\"fieldWarningClass(['zeroIncome', 'negativeDisposable', 'housing'])\" />\n    </div>\n  </div>\n</section>\n\n<section>\n  <h2 class=\"FormBlock-label\">Dependants</h2>\n\n  <div class=\"FormBlock FormBlock--grey Grid\">\n    <div class=\"FormRow\">\n      <label for=\"id_dependants-dependants_old\" class=\"cf\">\n        <span class=\"FormRow-label\">\n          Do you<span ng-if=\"hasPartner()\"> and your partner</span> have any dependants aged 16 and over? <guidance-link doc=\"eligibility_check/#ecg-dependants_over_16\"></guidance-link>\n        </span>\n        <input class=\"FormRow-field--xs\" id=\"id_dependants-dependants_old\" min=\"0\" type=\"number\" ng-model=\"eligibility_check.dependants_old\">\n      </label>\n    </div>\n\n    <div class=\"FormRow\">\n      <label for=\"id_dependants-dependants_young\" class=\"cf\">\n        <span class=\"FormRow-label\">\n          Do you<span ng-if=\"hasPartner()\"> and your partner</span> have any dependants aged 15 and under? <guidance-link doc=\"eligibility_check/#ecg-dependants_under_16\"></guidance-link>\n        </span>\n        <input class=\"FormRow-field--xs\" id=\"id_dependants-dependants_young\" min=\"0\" type=\"number\" ng-model=\"eligibility_check.dependants_young\">\n      </label>\n    </div>\n  </div>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/eligibility.problem.html',
        "<p>What is your problem about? What is putting you at immediate risk? <guidance-link doc=\"eligibility_check/#ecg-your_problem\"></guidance-link></p>\n\n<section class=\"FormBlock\">\n  <cla-server-validate data-for=\"category\"></cla-server-validate>\n\n  <div class=\"FormRow FormRow--group FormRow--groupNarrow\" ng-repeat=\"category in category_list\">\n    <label class=\"FormRow-label\">\n      <input type=\"radio\" name=\"category\" ng-model=\"eligibility_check.category\" value=\"{{ category.code }}\" >\n      {{ category.name }}\n    </label>\n  </div>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/login.html',
        "<main id=\"wrapper\" class=\"group\">\n  <div class=\"Grid\">\n    <div class=\"Grid-row cf\">\n      <div class=\"Grid-col Grid-col--3-5 Grid-colPush--1-5\">\n        <header class=\"PageHeader\">\n          <h1>Session Expired</h1>\n        </header>\n\n        <p>Your last session has timed out.\n          <br>Sign in again to avoid losing any data you have entered.</p>\n\n        <form autocomplete=\"off\" method=\"post\" ng-submit=\"login(login_frm)\" name=\"login_frm\">\n          <span class=\"Error-message Error-all\" ng-if=\"login_frm.$error.server\">{{ errors.__all__ }}</span>\n          <input type=\"hidden\" name=\"csrfmiddlewaretoken\" value=\"ouXbtrw2UtE9fg0dRwExncwVkP3MVgpP\">\n\n          <div class=\"FormRow cf\">\n            <label for=\"id_username\" id=\"id_username-label\">\n              <span class=\"FormRow-label\">Username</span>\n              <span class=\"Error-message\" ng-if=\"login_frm.username.$error.server\">{{ errors.username }}</span>\n              <input id=\"id_username\" maxlength=\"254\" name=\"username\" type=\"text\" ng-model=\"username\">\n            </label>\n          </div>\n\n          <div class=\"FormRow cf\">\n            <label for=\"id_password\" id=\"id_password-label\">\n              <span class=\"FormRow-label\">Password</span>\n              <span class=\"Error-message\" ng-if=\"login_frm.password.$error.server\">{{ errors.password }}</span>\n              <input id=\"id_password\" name=\"password\" type=\"password\" ng-model=\"password\" autocomplete=\"off\">\n            </label>\n          </div>\n\n          <div class=\"FormActions\">\n            <button type=\"submit\" value=\"Signin\" name=\"login-submit\" class=\"Button\">Sign in</button>\n          </div>\n        </form>\n      </div>\n    </div>\n  </div>\n</main>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/personal_details.html',
        "<section id=\"personal_details\">\n  <div ng-show=\"!personal_details.reference && !personal_details_frm_visible\">\n    <label class=\"FormRow cf\">\n      <span class=\"Icon--formRow Icon Icon--user\">\n        <input type=\"text\" id=\"searchPerson\" ui-select2=\"searchPersonOptions\" name=\"person_q\" class=\"FormRow-field--full\" placeholder=\"Search for existing user\" ng-model=\"$parent.person_q\">\n      </span>\n    </label>\n\n    <div class=\"FormRow Icon--formRow\">\n      <button class=\"Button Button--secondary Button--add\" ng-click=\"showPersonalDetails(personaldetails_frm, true)\" name=\"create-newuser\">Create new user</button>\n    </div>\n  </div>\n\n  <div ng-click=\"showPersonalDetails(personaldetails_frm)\" ng-show=\"!personaldetails_frm.$visible && personal_details.reference\" class=\"VCard VCard-view\" ng-class=\"{'u-mute': case.thirdparty_details}\">\n    <h2 class=\"VCard-title Icon Icon--formRow Icon--user\" ng-if=\"personal_details.full_name\" title=\"Full name\">\n      {{ personal_details.full_name }}\n    </h2>\n\n    <div class=\"VCard-row Icon Icon--row Icon--location\" ng-if=\"personal_details.postcode || personal_details.street\" title=\"Address\">\n      <p class=\"u-compact\" ng-if=\"personal_details.postcode\">{{ personal_details.postcode }}</p>\n      <p class=\"u-compact\" ng-bind-html=\"personal_details.street|escapeHtml|nl2br\"></p>\n    </div>\n\n    <p class=\"VCard-row Icon Icon--row Icon--call\" ng-if=\"personal_details.mobile_phone\" ng-class=\"{'Icon--red Icon--dontcall': personal_details.safe_to_contact === 'DONT_CALL', 'Icon--red Icon--novoicemail': personal_details.safe_to_contact === 'NO_MESSAGE', 'Icon--green': personal_details.safe_to_contact === 'SAFE'}\" title=\"Phone number\">\n      <span ng-class=\"{'u-strike': personal_details.safe_to_contact !== 'SAFE'}\">{{ personal_details.mobile_phone }}</span>\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--email\" ng-if=\"personal_details.email\" title=\"Email address\">\n      {{ personal_details.email }}\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--dob\" ng-if=\"personal_details.dob\" title=\"Date of birth\">\n      {{ personal_details.dob | dob }} (Age {{ personal_details.dob | ageFromDate }})\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--ni\" ng-if=\"personal_details.ni_number\" title=\"National Insurance Number\">\n      {{ personal_details.ni_number }}\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--language\" ng-if=\"adaptations.language\" title=\"Language\">\n      {{ getLanguageLabel(adaptations.language) }}\n    </p>\n\n    <div class=\"VCard-row Icon Icon--row Icon--adaptation\" ng-if=\"selected_adaptations.length\" title=\"Adaptation\">\n      <ul class=\"InlineList\">\n        <li class=\"InlineList-item\" ng-repeat=\"item in selected_adaptations\">{{ getAdaptationLabel(item) }}</li>\n      </ul>\n    </div>\n\n    <p class=\"VCard-row Icon Icon--row Icon--mediaCode\" ng-if=\"case.media_code\" title=\"Media code\">\n      <span>{{ mediaCode(media_code).label }}</span>\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--source\" ng-if=\"case.source\" title=\"Case source\">\n      <span>{{ getDisplayLabel(case.source, sources) }}</span>\n    </p>\n\n    <p class=\"VCard-row u-highlightRed\" ng-if=\"personal_details.vulnerable_user\">User is deemed vulnerable</p>\n\n    <p class=\"VCard-row\" ng-if=\"case.exempt_user\">User is exempt because: {{ getExemptReasonByCode(case.exempt_user_reason).text }}</p>\n\n    <p class=\"VCard-row\" ng-if=\"personal_details.full_name\">User <strong ng-if=\"personal_details.contact_for_research\">can</strong><strong ng-if=\"!personal_details.contact_for_research\">cannot</strong> be contacted for research</p>\n\n    <p class=\"VCard-row\" ng-if=\"adaptations.notes\">\n      {{ adaptations.notes }}\n    </p>\n  </div>\n\n   <form novalidate autocomplete=\"off\" method=\"post\" name=\"personaldetails_frm\" class=\"VCard VCard-edit\" ng-class=\"{submitted: personaldetails_submitted}\" onbeforesave=\"validate(personaldetails_frm.$valid)\" onaftersave=\"savePersonalDetails(personaldetails_frm)\" ng-show=\"personaldetails_frm.$visible\" editable-form>\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.full_name.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.full_name.$error.server\">{{ errors.full_name }}</span>\n      <span class=\"Icon Icon--formRow Icon--user\" title=\"Full name\">\n        <span editable-text=\"personal_details.full_name\" e-name=\"full_name\" e-class=\"FormRow-field--full\" e-placeholder=\"Name\" e-server-error></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.postcode.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.postcode.$error.server\">{{ errors.postcode }}</span>\n      <span class=\"Icon Icon--formRow Icon--location\" title=\"Post code\">\n        <span editable-text=\"personal_details.postcode\" e-name=\"postcode\" e-class=\"FormRow-field--full\" e-placeholder=\"Postcode\" e-server-error e-address-finder=\".js-AF-PersonalDetailsStreet\"></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.street.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.street.$error.server\">{{ errors.street }}</span>\n      <span class=\"Icon Icon--formRow Icon--address\" title=\"Address\">\n        <span editable-textarea=\"personal_details.street\" e-name=\"street\" e-class=\"FormRow-field--full js-AF-PersonalDetailsStreet\" e-placeholder=\"Address\" e-rows=\"6\" e-server-error></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.mobile_phone.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.mobile_phone.$error.server\">{{ errors.mobile_phone }}</span>\n      <span class=\"Icon Icon--formRow\" title=\"Phone number\">\n        <span editable-text=\"personal_details.mobile_phone\" e-name=\"mobile_phone\" e-class=\"FormRow-field--full\" e-placeholder=\"Phone\" e-ng-class=\"{'u-strike': personal_details.contact_safety.safe === false}\" e-server-error></span>\n        <safe-to-contact person=\"personal_details\"></safe-to-contact>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.email.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.email.$error.server\">{{ errors.email }}</span>\n      <span class=\"Icon Icon--formRow Icon--email\" title=\"Email\">\n        <span editable-text=\"personal_details.email\" e-name=\"email\" e-class=\"FormRow-field--full\" e-placeholder=\"Email\" e-server-error></span>\n      </span>\n    </label>\n\n    <fieldset class=\"FormRow FormRow--narrow\"  ng-class=\"{Error: personaldetails_frm.dob.$invalid || personaldetails_frm.dob_year.$invalid && personaldetails_submitted}\">\n      <span class=\"Icon Icon--dob Icon--formRow\" title=\"Date of birth\">\n        <span class=\"Error-message\" ng-if=\"personaldetails_frm.dob.$error.server\">{{ errors.dob }}</span>\n        <span editable-tpde=\"personal_details.dob\" e-name=\"dob\" e-server-error></span>\n      </span>\n    </fieldset>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.ni_number.$invalid && personaldetails_submitted}\">\n      <span class=\"Icon Icon--ni Icon--formRow\" title=\"National Insurance number\">\n        <span class=\"Error-message\" ng-if=\"personaldetails_frm.ni_number.$error.server\">{{ errors.ni_number }}</span>\n        <span editable-text=\"personal_details.ni_number\" e-name=\"ni_number\" e-class=\"FormRow-field--full\" e-placeholder=\"National Insurance Number\" e-ni-number e-server-error></span>\n        <span class=\"Error-message\" ng-if=\"personaldetails_frm.ni_number.$error.nino && personaldetails_submitted\">Invalid NI Number</span>\n      </span>\n    </label>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.welsh_override.$invalid || personaldetails_frm.language.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.welsh_override.$error.server\">{{ errors.welsh_override }}</span>\n      <span editable-checkbox=\"language.welsh_override\" e-name=\"welsh_override\" e-title=\"Welsh\" e-ng-click=\"toggleWelsh($data)\"></span>\n      <span class=\"Icon Icon--language Icon--formRow\" title=\"Language\">\n        <span class=\"Error-message\" ng-if=\"personaldetails_frm.language.$error.server\">{{ errors.language }}</span>\n        <span editable-filterselect=\"adaptations.language\" e-name=\"language\" e-ng-options=\"s.value as s.text for s in language_options track by s.value\" e-class=\"FormRow-field--full\" e-data-placeholder=\"Choose a language\" e-ng-disabled=\"language.disable\"></span>\n      </span>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\">\n      <span class=\"Icon Icon--adaptation Icon--formRow\" title=\"Adaptations\">\n        <span editable-filterselect=\"selected_adaptations\" e-multiple e-ng-options=\"k as v for (k,v) in adaptation_flags\" e-name=\"adaptations\" e-data-placeholder=\"Choose adaptations\" e-server-error></span>\n      </span>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\">\n      <span class=\"Icon Icon--mediaCode Icon--formRow\" title=\"Media code\">\n        <span editable-filterselect=\"media_code\" e-ng-options=\"s.code as s.label group by s.group for s in media_codes track by s.code\" e-name=\"media_code\" e-data-placeholder=\"Choose media code\" e-server-error></span>\n      </span>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\">\n      <span class=\"Icon Icon--source Icon--formRow\" title=\"Case source\">\n        <span editable-filterselect=\"source\" e-ng-options=\"s.value as s.text for s in sources track by s.value\" e-name=\"source\" e-data-placeholder=\"Choose source\" e-server-error></span>\n      </span>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.vulnerable_user.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.vulnerable_user.$error.server\">{{ errors.vulnerable_user }}</span>\n      <span editable-checkbox=\"personal_details.vulnerable_user\" e-name=\"vulnerable_user\" e-title=\"User is deemed vulnerable\"></span>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.exempt_user.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.exempt_user.$error.server\">{{ errors.exempt_user }}</span>\n      <span editable-checkbox=\"case.exempt_user\" e-name=\"exempt_user\" e-title=\"User is exempt (Debt, Edu, Discrim only)\" e-ng-change=\"exemptChange($data)\"></span>\n    </div>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.exempt_user_reason.$invalid && personaldetails_submitted}\" ng-if=\"is_exempt\">\n      <span class=\"Icon Icon--formRow\">\n        <span class=\"Error-message\" ng-if=\"personaldetails_frm.exempt_user_reason.$error.server\">{{ errors.exempt_user_reason }}</span>\n        <span editable-filterselect=\"case.exempt_user_reason\"\n              e-name=\"exempt_user_reason\"\n              e-ng-options=\"s.value as s.text for s in exempt_user_reason_choices track by s.value\"\n              e-class=\"FormRow-field--full\"\n              e-data-placeholder=\"Why is client exempt?\"\n              e-server-error></span>\n      </span>\n    </label>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.contact_for_research.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.contact_for_research.$error.server\">{{ errors.contact_for_research }}</span>\n      <span editable-checkbox=\"personal_details.contact_for_research\" e-name=\"contact_for_research\" e-title=\"Can contact user for research\" e-ng-change=\"researchChange($data)\"></span>\n    </div>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.contact_for_research_via.$invalid && personaldetails_submitted}\" ng-if=\"contact_for_research\">\n      <span class=\"Icon Icon--formRow\">\n        <span class=\"Error-message\" ng-if=\"personaldetails_frm.contact_for_research_via.$error.server\">{{ errors.contact_for_research_via }}</span>\n        <span editable-filterselect=\"personal_details.contact_for_research_via\"\n              e-name=\"contact_for_research_via\"\n              e-ng-options=\"s.value as s.text for s in contact_for_research_via_choices track by s.value\"\n              e-class=\"FormRow-field--full\"\n              e-data-placeholder=\"What method method would they like to be contacted via?\"\n              e-server-error></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: personaldetails_frm.notes.$invalid && personaldetails_submitted}\">\n      <span class=\"Error-message\" ng-if=\"personaldetails_frm.notes.$error.server\">{{ errors.notes }}</span>\n      <span editable-textarea=\"adaptations.notes\" e-name=\"notes\" e-rows=\"3\" e-cols=\"20\" e-maxlength=\"255\" e-class=\"FormRow-field--full\" e-placeholder=\"Add comments\" e-server-error></span>\n    </label>\n\n    <div class=\"FormActions cf\">\n      <button type=\"submit\" class=\"Button\" ng-click=\"personaldetails_submitted=true\" name=\"save-personal-details\">Save</button>\n      <button type=\"reset\" class=\"Button Button--text\" ng-click=\"cancelPersonalDetails(personaldetails_frm)\">Cancel</button>\n    </div>\n  </form>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/reset_password.html',
        "<main id=\"wrapper\" class=\"group\">\n  <div class=\"Grid\">\n    <div class=\"Grid-row cf\">\n      <div class=\"Grid-col Grid-col--3-5 Grid-colPush--1-5\">\n        <header class=\"PageHeader\">\n          <h1>Reset password for {{ user_.username }}</h1>\n        </header>\n\n        <form method=\"post\" ng-submit=\"save(reset_frm)\" name=\"reset_frm\">\n          <span class=\"Error-message Error-all\" ng-show=\"reset_frm.$error.server\">{{ errors.__all__ }}</span>\n          <div class=\"FormRow cf\" ng-show=\"!user.is_manager || user.username === user_.username\">\n            <label for=\"id_old_password\" id=\"id_old_password-label\">\n              <span class=\"Error-message\" ng-show=\"reset_frm.old_password.$error.server\">{{ errors.old_password }}</span>\n              <span class=\"FormRow-label\">Old Password</span>\n              <input id=\"id_new_password\" name=\"old_password\" type=\"password\" ng-model=\"old_password\" autocomplete=\"off\" server-error>\n            </label>\n          </div>\n\n          <div class=\"FormRow cf\">\n            <label for=\"id_new_password\" id=\"id_new_password-label\">\n              <span class=\"Error-message\" ng-show=\"reset_frm.new_password.$error.server\">{{ errors.new_password }}</span>\n              <span class=\"FormRow-label\">New Password</span>\n              <input id=\"id_old_password\" name=\"new_password\" type=\"password\" ng-model=\"new_password\" autocomplete=\"off\"  required=\"required\" server-error>\n            </label>\n          </div>\n\n          <div class=\"FormActions\">\n            <button type=\"submit\" name=\"reset-password-submit\" class=\"Button\">Reset</button>\n            <button type=\"button\" class=\"Button Button--text\" ng-click=\"$uibModalInstance.dismiss()\">Cancel</button>\n          </div>\n        </form>\n      </div>\n    </div>\n  </div>\n</main>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/session_expiring.html',
        "<header class=\"PageHeader\">\n  <h1>Your session is about to expire</h1>\n</header>\n\n<form autocomplete=\"off\" method=\"post\" ng-submit=\"extend()\" name=\"expire_frm\">\n  <p>You have been inactive for too long. Your session will expire in <strong idle-countdown=\"countdown\">{{ countdown }}</strong> seconds if you do not do anything.</p>\n\n  <div class=\"FormActions\">\n    <button type=\"submit\" value=\"extend\" name=\"extend-submit\" class=\"Button\">Extend session</button>\n    <button type=\"button\" value=\"logout\" name=\"logout\" class=\"Button Button--secondary\" ng-click=\"logout()\">Sign out</button>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('includes/third_party.html',
        "<div ng-class=\"{'Icon--formRow': !personal_details.reference && !personal_details_frm_visible}\">\n  <button href=\"\" class=\"Button Button--secondary Button--add\" ng-hide=\"case.thirdparty_details || add_thirdparty\" ng-click=\"showThirdParty(third_party_frm, true)\" name=\"add-thirdparty\">Add third party</button>\n</div>\n\n<section ng-show=\"case.thirdparty_details || add_thirdparty\" id=\"third_party\">\n  <div ng-click=\"showThirdParty(third_party_frm)\" ng-hide=\"third_party_frm.$visible\" class=\"VCard VCard--dark VCard-view\">\n    <h2 class=\"VCard-legend\">Third Party</h2>\n\n    <h3 class=\"VCard-title Icon Icon--formRow Icon--thirdparty\" ng-if=\"third_party.personal_details.full_name\" title=\"Full name\">\n      {{ third_party.personal_details.full_name }}\n    </h3>\n\n    <p class=\"VCard-row Icon Icon--row Icon--location\" ng-if=\"third_party.personal_details.postcode || third_party.personal_details.street\" title=\"Address\">\n      {{ third_party.personal_details.postcode }}<br>\n      <span ng-bind-html=\"third_party.personal_details.street|escapeHtml|nl2br\"></span>\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--call\" ng-if=\"third_party.personal_details.home_phone || third_party.personal_details.mobile_phone\" ng-class=\"{'Icon--red Icon--dontcall': third_party.personal_details.safe_to_contact === 'DONT_CALL', 'Icon--red Icon--novoicemail': third_party.personal_details.safe_to_contact === 'NO_MESSAGE', 'Icon--green': third_party.personal_details.safe_to_contact === 'SAFE'}\" title=\"Phone number\">\n      <span ng-class=\"{'u-strike': third_party.personal_details.safe_to_contact !== 'SAFE'}\">{{ third_party.personal_details.mobile_phone }}</span>\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--email\" ng-if=\"third_party.personal_details.email\" title=\"Email\">\n      {{ third_party.personal_details.email }}\n    </p>\n\n    <p class=\"VCard-row Icon Icon--row Icon--safe\" ng-if=\"third_party.pass_phrase\" title=\"Pass phrase\">\n      {{ third_party.pass_phrase }}\n    </p>\n\n    <p class=\"VCard-row\" ng-if=\"third_party.personal_relationship\" title=\"Relationship\">\n      {{ getDisplayLabel(third_party.personal_relationship, relationships) }}<span ng-if=\"third_party.organisation_name\">: {{ third_party.organisation_name }}</span>\n    </p>\n\n    <p class=\"VCard-row\" ng-if=\"third_party.spoke_to === true || third_party.spoke_to === false\">\n      <span class=\"u-block\">Adviser <strong>has <span ng-if=\"!third_party.spoke_to\">not </span></strong> spoken with client<span ng-if=\"!third_party.spoke_to && third_party.reason\"> <strong>because</strong> '{{ getDisplayLabel(third_party.reason, reasons) }}'</span></span>\n    </p>\n\n    <p class=\"VCard-row\" ng-if=\"third_party.personal_details.full_name\">Third party <strong ng-if=\"third_party.personal_details.contact_for_research\">can</strong><strong ng-if=\"!third_party.personal_details.contact_for_research\">cannot</strong> be contacted for research</p>\n  </div>\n\n  <form novalidate autocomplete=\"off\" method=\"post\" name=\"third_party_frm\" class=\"VCard VCard--dark VCard-edit\" ng-class=\"{submitted: thirdparty_submitted}\" onbeforesave=\"validate(third_party_frm.$valid)\" onaftersave=\"saveThirdParty(third_party_frm)\" ng-show=\"third_party_frm.$visible\" editable-form>\n    <h2 class=\"VCard-legend\">Third Party</h2>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.full_name.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.full_name.$error.server\">{{ errors.full_name }}</span>\n      <span class=\"Icon--formRow Icon Icon--thirdparty\" title=\"Full name\">\n        <span editable-text=\"third_party.personal_details.full_name\" e-name=\"full_name\" e-class=\"FormRow-field--full\" e-placeholder=\"Name\"></span>\n      </span>\n    </label>\n\n    <copy-user-address pd-edit=\"personal_details_frm_visible\" pd-model=\"personal_details\"></copy-user-address>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.postcode.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.postcode.$error.server\">{{ errors.postcode }}</span>\n      <span class=\"Icon Icon--formRow Icon--location\" title=\"Post code\">\n        <span editable-text=\"third_party.personal_details.postcode\" e-name=\"postcode\" e-class=\"FormRow-field--full\" e-placeholder=\"Postcode\" e-server-error e-address-finder=\".js-AF-ThirdPartyStreet\"></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.street.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.street.$error.server\">{{ errors.street }}</span>\n      <span class=\"Icon Icon--formRow Icon--address\" title=\"Address\">\n        <span editable-textarea=\"third_party.personal_details.street\" e-name=\"street\" e-class=\"FormRow-field--full js-AF-ThirdPartyStreet\" e-placeholder=\"Address\" e-rows=\"6\" e-server-error></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.mobile_phone.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.mobile_phone.$error.server\">{{ errors.mobile_phone }}</span>\n      <span class=\"Icon--formRow Icon\" title=\"Phone number\">\n        <span editable-text=\"third_party.personal_details.mobile_phone\" e-name=\"mobile_phone\" e-class=\"FormRow-field--full\" e-placeholder=\"Contact number\"></span>\n        <safe-to-contact person=\"third_party.personal_details\"></safe-to-contact>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.email.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.email.$error.server\">{{ errors.email }}</span>\n      <span class=\"Icon--formRow Icon Icon--email\" title=\"Email\">\n        <span editable-text=\"third_party.personal_details.email\" e-name=\"email\" e-class=\"FormRow-field--full\" e-placeholder=\"Email\"></span>\n      </span>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.pass_phrase.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.pass_phrase.$error.server\">{{ errors.pass_phrase }}</span>\n      <span class=\"Icon--formRow Icon Icon--safe\" title=\"Pass phrase\">\n        <span editable-text=\"third_party.pass_phrase\" e-name=\"pass_phrase\" e-class=\"FormRow-field--full\" e-placeholder=\"Passphrase\" e-ng-required=\"passphrase_required\"></span>\n      </span>\n    </label>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.personal_relationship.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.personal_relationship.$error.server\">{{ errors.personal_relationship }}</span>\n      <span class=\"Icon--formRow\">\n        <span editable-filterselect=\"third_party.personal_relationship\" e-name=\"personal_relationship\" e-ng-options=\"s.value as s.text for s in relationships track by s.value\" e-ng-change=\"relationshipChange($data)\" e-data-placeholder=\"Choose a relationship\" onbeforesave=\"validateRadio($data)\"></span>\n      </span>\n    </div>\n\n    <div ng-if=\"is_legal_advisor\">\n      <label class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.organisation_name.$invalid && thirdparty_submitted}\">\n        <span class=\"Error-message\" ng-if=\"third_party_frm.organisation_name.$error.server\">{{ errors.organisation_name }}</span>\n        <span class=\"Icon--formRow Icon Icon--briefcase\">\n          <span editable-text=\"third_party.organisation_name\" e-name=\"organisation_name\" e-class=\"FormRow-field--full\" e-placeholder=\"Legal adviser\"></span>\n        </span>\n      </label>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.spoke_to.$invalid && thirdparty_submitted}\">\n      <div class=\"Icon--formRow\">\n        <span class=\"Error-message\" ng-if=\"third_party_frm.spoke_to.$error.server\">{{ errors.spoke_to }}</span>\n        <label>Advisor has spoken to client</label>\n        <span editable-radiolist=\"third_party.spoke_to\" e-name=\"spoke_to\" e-ng-options=\"s.value as s.text for s in spokenOptions\" e-ng-click=\"spokenWithToggle($data)\"></span>\n      </div>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-if=\"show_reason\" ng-class=\"{Error: third_party_frm.reason.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.reason.$error.server\">{{ errors.reason }}</span>\n      <span class=\"Icon--formRow\">\n        <span editable-filterselect=\"third_party.reason\" e-name=\"reason\" e-ng-options=\"s.value as s.text for s in reasons track by s.value\" e-data-placeholder=\"Choose a reason for why not\"></span>\n      </span>\n    </div>\n\n    <div class=\"FormRow FormRow--narrow cf\" ng-class=\"{Error: third_party_frm.contact_for_research.$invalid && thirdparty_submitted}\">\n      <span class=\"Error-message\" ng-if=\"third_party_frm.contact_for_research.$error.server\">{{ errors.contact_for_research }}</span>\n      <span editable-checkbox=\"third_party.personal_details.contact_for_research\" e-name=\"contact_for_research\" e-title=\"Can contact third party for research\"></span>\n    </div>\n\n    <div class=\"FormActions cf\">\n      <button type=\"submit\" class=\"Button\" ng-click=\"thirdparty_submitted=true\" name=\"save-thirdparty\">Save</button>\n      <button type=\"reset\" class=\"Button Button--text\" ng-click=\"cancelThirdParty(third_party_frm)\">Cancel</button>\n    </div>\n  </form>\n</section>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/case_detail.feedback.html',
        "<hr class=\"u-horLine\">\n\n<h2 class=\"CaseHistory-subtitle\">Feedback</h2>\n\n<button type=\"button\" class=\"Button Button--secondary Button--add\" ng-hide=\"showFeedbackFrm\" ng-click=\"showFeedbackFrm=!showFeedbackFrm\" name=\"leave-feedback\">Leave feedback</button>\n\n<div ng-show=\"showFeedbackFrm\">\n  <form ng-submit=\"submit()\" name=\"inline-provider-feedback-frm\">\n    <label class=\"FormRow FormRow--narrow cf\">\n      <select\n        id=\"newFeedback_issue\"\n        ng-model=\"::newFeedback.issue\"\n        ui-select2=\"{allowClear: true}\"\n        placeholder=\"Issue\"\n        ng-options=\"s.value as s.text for s in FEEDBACK_ISSUE track by s.value\"\n        ng-required=\"true\">\n        <option value=\"\"></option>\n      </select>\n    </label>\n\n    <label class=\"FormRow FormRow--narrow cf\">\n      <textarea ng-model=\"::newFeedback.comment\" rows=\"5\" ng-required=\"true\" placeholder=\"Comments\"></textarea>\n    </label>\n\n    <div class=\"FormActions\">\n      <button class=\"Button\" type=\"submit\" name=\"save-feedback\">Save</button>\n      <a href=\"\" ng-click=\"showFeedbackFrm=false\">Cancel</a>\n    </div>\n  </form>\n</div>\n\n<ul class=\"CaseHistory\" ng-if=\"feedbackList\">\n  <li class=\"CaseHistory-card\" ng-repeat=\"feedbackItem in feedbackList\">\n    <span>\n      <timestamp ng-model=\"feedbackItem.created\"></timestamp>\n      ({{ ::feedbackItem.created_by }})\n    </span>\n\n    <ul class=\"CaseHistory-log\">\n      <li class=\"CaseHistory-logItem cf\">\n        <span class=\"CaseHistory-logItemNotes\">{{ ::(feedbackItem.issue|constantByValue:FEEDBACK_ISSUE).text }}</span>\n        <span class=\"CaseHistory-logItemNotes\">{{ ::feedbackItem.comment }}</span>\n      </li>\n    </ul>\n  </li>\n</ul>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/case_detail.html',
        "<div data-extend-template=\"case_detail.html\">\n  <nav class=\"CaseBar-actions BtnGroup\" data-block=\"case-actions\" ng-controller=\"AcceptRejectCaseCtrl\">\n\n    <button class=\"BtnGroup-button BtnGroup-button--light\" name=\"accept-case\" ng-click=\"accept()\" ng-if=\"!case.provider_accepted && !case.provider_closed\">Accept</button>\n\n    <button class=\"BtnGroup-button BtnGroup-button--light\" name=\"reject-case\" ng-click=\"reject()\" ng-if=\"!case.provider_closed\">Reject</button>\n\n    <button class=\"BtnGroup-button BtnGroup-button--light\" name=\"reopen-case\" ng-click=\"reopen()\" ng-if=\"case.provider_closed\">Reopen</button>\n\n    <button class=\"BtnGroup-button BtnGroup-button--light\" name=\"split-case\" ng-click=\"split()\" ng-if=\"!case.provider_closed\">Split</button>\n\n    <a href=\"/provider/case/{{ case.reference }}/legal_help_form/\" target=\"_self\" class=\"BtnGroup-button BtnGroup-button--light\" ng-if=\"case.provider_accepted || case.provider_closed\">Legal help form</a>\n\n    <button class=\"BtnGroup-button BtnGroup-button--light\" name=\"provider-close-case\" ng-click=\"close()\" ng-controller=\"CaseDetailCloseCtrl\" ng-if=\"case.provider_accepted && !case.provider_closed\">Close</button>\n\n    <button class=\"BtnGroup-button BtnGroup-button--light\" name=\"debt-referral-case\" ng-click=\"closeAsDREFER()\" ng-controller=\"CaseDetailCloseCtrl\" ng-if=\"showDebtReferralButton()\">Debt referral</button>\n\n  </nav>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/case_detail.split.html',
        "<header>\n  <h2>Split case {{ ::case.reference }}</h2>\n</header>\n\n<div class=\"SummaryBlock\">\n  <div class=\"SummaryBlock-content Grid\">\n    <p class=\"Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">Category of law</span>\n      <span class=\"Grid-col Grid-col--2-3\">{{ ::provider_category.name }}</span>\n    </p>\n    <p class=\"Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">Matter type</span>\n      <span class=\"Grid-col Grid-col--2-3\">\n        {{ ::case.matter_type1 }}\n        <br>{{ ::case.matter_type2 }}\n      </span>\n    </p>\n    <p class=\"Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">Assigned to</span>\n      <span class=\"Grid-col Grid-col--2-3\">{{ ::user.provider.name }}</span>\n    </p>\n  </div>\n</div>\n\n<form method=\"post\" name=\"split_case_frm\">\n  <h2>New case</h2>\n\n  <div class=\"FormBlock FormBlock--yellow Grid\">\n    <label class=\"FormRow Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3\">\n        <span class=\"FormRow-label FormRow-label--inline FormRow-label--right\">Category of law</span>\n      </span>\n\n      <span class=\"Grid-col Grid-col--2-3\">\n        <span class=\"cf\">\n          <select ui-select2 name=\"category\" class=\"FormRow-field--full\" placeholder=\"Choose category of law\" ng-model=\"category\" ng-options=\"cat.code as cat.name for cat in categories track by cat.code\" required server-error>\n            <option value=\"\"></option>\n          </select>\n        </span>\n\n        <span class=\"Error-message\" ng-if=\"split_case_frm.category.$error.server\">{{ errors.category }}</span>\n      </span>\n    </label>\n\n    <label class=\"FormRow Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">\n        <span class=\"FormRow-label FormRow-label--inline FormRow-label--right\">Matter type 1</span>\n      </span>\n\n      <span class=\"Grid-col Grid-col--2-3\">\n        <span class=\"cf\">\n          <select ui-select2 name=\"matter_type1\" placeholder=\"Choose matter type 1\" class=\"FormRow-field--inline FormRow-field--full\" ng-model=\"matterType1\" ng-options=\"matterType.code as (matterType.code + ' - ' + matterType.description) for matterType in matterTypes | filter:{level: 1} track by matterType.code\" ng-disabled=\"!matterTypes.length\" ng-required=\"matterTypes.length\" server-error>\n            <option value=\"\"></option>\n          </select>\n        </span>\n\n        <span class=\"Error-message\" ng-if=\"split_case_frm.matter_type1.$error.server\">Matter type 1: {{ errors.matter_type1 }}</span>\n      </span>\n    </label>\n\n    <label class=\"FormRow Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">\n        <span class=\"FormRow-label FormRow-label--inline FormRow-label--right\">Matter type 2</span>\n      </span>\n\n      <span class=\"Grid-col Grid-col--2-3\">\n        <span class=\"cf\">\n          <select ui-select2 name=\"matter_type2\" placeholder=\"Choose matter type 2\" class=\"FormRow-field--inline FormRow-field--full\" ng-model=\"matterType2\" ng-options=\"matterType.code as (matterType.code + ' - ' + matterType.description) for matterType in matterTypes | filter:{level: 2} track by matterType.code\" ng-disabled=\"!matterTypes.length\" ng-required=\"matterTypes.length\" server-error>\n            <option value=\"\"></option>\n          </select>\n        </span>\n\n        <span class=\"Error-message\" ng-if=\"split_case_frm.matter_type2.$error.server\">Matter type 2: {{ errors.matter_type2 }}</span>\n      </span>\n    </label>\n\n    <label class=\"FormRow Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">\n        <span class=\"FormRow-label FormRow-label--inline FormRow-label--right\">Notes</span>\n      </span>\n\n      <span class=\"Error-message\" ng-if=\"split_case_frm.notes.$error.server\">{{ errors.notes }}</span>\n\n      <span class=\"Grid-col Grid-col--2-3\">\n        <textarea name=\"notes\" cols=\"30\" rows=\"4\" ng-model=\"::notes\" placeholder=\"Enter comments\"></textarea>\n      </span>\n    </label>\n\n    <fieldset class=\"FormRow FormRow--group FormRow--groupNarrow Grid-row cf\">\n      <span class=\"Grid-col Grid-col--1-3 u-alignRight\">\n        <span class=\"FormRow-label FormRow-label--inline FormRow-label--right\">Assign</span>\n      </span>\n\n      <span class=\"Error-message\" ng-if=\"split_case_frm.notes.$error.server\">{{ errors.notes }}</span>\n\n      <span class=\"Grid-col Grid-col--2-3\">\n        <span class=\"FormRow\">\n          <label class=\"FormRow-label\">\n            <input type=\"radio\" name=\"internal\" value=\"true\" ng-model=\"::internal\" required>\n            <span class=\"FormRow-labelText\">\n              Internally to {{ ::user.provider.name }}\n              <span class=\"Error-message\" ng-if=\"errors.internal\">{{ errors.internal }}</span>\n            </span>\n          </label>\n        </span>\n        <span class=\"FormRow\">\n          <label class=\"FormRow-label\">\n            <input type=\"radio\" name=\"internal\" value=\"false\" ng-model=\"::internal\" required>\n            <span class=\"FormRow-labelText\">To operator for assignment</span>\n          </label>\n        </span>\n\n        <span class=\"Error-message\" ng-if=\"split_case_frm.internal.$error.required && submitted\">You must choose who to assign the case to</span>\n      </span>\n    </fieldset>\n  </div>\n\n  <div class=\"FormActions\">\n    <p class=\"Error-message\" ng-if=\"errors.__all__\">{{ errors.__all__ }}</p>\n\n    <button class=\"Button\" name=\"save-split-case\" type=\"submit\" ng-click=\"doSplit(split_case_frm)\">Split case</button>\n    <a href=\"\" ng-click=\"cancel()\">Cancel</a>\n  </div>\n</form>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/case_list.html',
        "<div data-extend-template=\"case_list.html\">\n  <div data-block=\"title\" ng-include=\"'provider/includes/case_tab_navigation.html'\"></div>\n\n  <span data-block=\"filters\" class=\"LabelGroup\">\n    <a href=\"\" class=\"Label\" ng-class=\"filterClass('')\" ng-click=\"filterCases('')\">All</a>\n    <a href=\"\" class=\"Label Icon Icon--folderNew\" ng-class=\"filterClass('new')\" ng-click=\"filterCases('new')\">New</a>\n    <a href=\"\" class=\"Label Icon Icon--folder\" ng-class=\"filterClass('opened')\" ng-click=\"filterCases('opened')\">Opened</a>\n    <a href=\"\" class=\"Label Icon Icon--folderAccepted\" ng-class=\"filterClass('accepted')\" ng-click=\"filterCases('accepted')\">Accepted</a>\n    <a href=\"\" class=\"Label Icon Icon--folderClosed\" ng-class=\"filterClass('closed')\" ng-click=\"filterCases('closed')\">Closed</a>\n  </span>\n\n  <span data-block=\"outcome-column\">Outcome code</span>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/user_list.html',
        "<div data-extend-template=\"user_list.html\">\n  <div data-block=\"title\" ng-include=\"'provider/includes/case_tab_navigation.html'\"></div>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/includes/case_notes.html',
        "<notes-form ng-model=\"case.notes\" case=\"case\"></notes-form>\n\n<div ng-if=\"eligibility_check.notes\">\n  <figure class=\"CommentBlock Icon Icon--row Icon--comments\">\n    <cite class=\"CommentBlock-author\">User said</cite>\n    <blockquote class=\"Quote\" ng-bind-html=\"eligibility_check.notes|escapeHtml|nl2br\"></blockquote>\n  </figure>\n</div>\n\n<div ng-if=\"case.provider_notes\">\n  <figure class=\"CommentBlock Icon Icon--row Icon--comments\">\n    <a href=\"\" notes-history=\"{{ case.reference }}\" history-type=\"cla_provider\" summary=\"true\" class=\"CommentBlock-history\" title=\"View notes history\"></a>\n    <cite class=\"CommentBlock-author\">Specialist provider said</cite>\n    <blockquote class=\"Quote\" ng-bind-html=\"::case.provider_notes|escapeHtml|nl2br\"></blockquote>\n  </figure>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('call_centre/includes/case_tab_navigation.html',
        "<ul class=\"Tabs Tabs--large\"><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('case_list') || $state.includes('callbacks')}\">\n    <a ui-sref=\"case_list\" class=\"Tabs-tabLink\">Cases</a>\n  </li><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('feedback_list')}\">\n    <a ui-sref=\"feedback_list\" class=\"Tabs-tabLink\">Feedback</a>\n  </li><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('complaints_list')}\">\n    <a ui-sref=\"complaints_list\" class=\"Tabs-tabLink\">Complaints</a>\n  </li><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('user_list')}\">\n    <a ui-sref=\"user_list\" class=\"Tabs-tabLink\">Users</a>\n  </li><!--\n--></ul>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('directives/pagination/dirPagination.tpl.html',
        "<nav class=\"Pagination\" ng-if=\"pages.length > 1\">\n  <p class=\"Pagination-prefix\">Page</p>\n\n  <ul class=\"Pagination-list cf\" ng-if=\"1 < pages.length\">\n    <li ng-if=\"boundaryLinks\" ng-class=\"{'is-disabled': pagination.current == 1}\" class=\"Pagination-item\">\n      <a href=\"\" ng-click=\"setCurrent(1)\">|&lsaquo; First</a>\n    </li>\n\n    <li ng-if=\"directionLinks && pagination.current != 1\" ng-class=\"{'is-disabled': pagination.current == 1}\" class=\"Pagination-item\">\n      <a href=\"\" ng-click=\"setCurrent(pagination.current - 1)\" class=\"ng-binding\">&lsaquo;<span class=\"visuallyhidden\"> Prev</span></a>\n    </li>\n    <li ng-repeat=\"pageNumber in pages track by $index\" ng-class=\"{'is-current': pagination.current == pageNumber, 'is-disabled': pageNumber == '...'}\" class=\"Pagination-item Pagination-item--num\">\n      <a href=\"\" ng-click=\"setCurrent(pageNumber)\">{{ pageNumber }}</a>\n    </li>\n    <li ng-if=\"directionLinks && pagination.current != pagination.last\" ng-class=\"{'is-disabled': pagination.current == pagination.last}\" class=\"Pagination-item\">\n      <a href=\"\" ng-click=\"setCurrent(pagination.current + 1)\" class=\"ng-binding\"><span class=\"visuallyhidden\">Next </span>&rsaquo;</a>\n    </li>\n\n    <li ng-if=\"boundaryLinks\"  ng-class=\"{'is-disabled': pagination.current == pagination.last}\" class=\"Pagination-item\">\n      <a href=\"\" ng-click=\"setCurrent(pagination.last)\">Last &rsaquo;|</a>\n    </li>\n  </ul>\n</nav>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/includes/case_notes.html',
        "<notes-form ng-model=\"case.provider_notes\" case=\"case\"></notes-form>\n\n<div ng-if=\"eligibility_check.notes\">\n  <figure class=\"CommentBlock Icon Icon--row Icon--comments\">\n    <cite class=\"CommentBlock-author\">User said</cite>\n    <blockquote class=\"Quote\" ng-bind-html=\"eligibility_check.notes|escapeHtml|nl2br\"></blockquote>\n  </figure>\n</div>\n\n<div ng-if=\"case.notes\">\n  <figure class=\"CommentBlock Icon Icon--row Icon--comments\">\n    <a href=\"\" notes-history=\"{{ case.reference }}\" history-type=\"operator\" summary=\"true\" class=\"CommentBlock-history\" title=\"View notes history\"></a>\n    <cite class=\"CommentBlock-author\">Operator said</cite>\n    <blockquote class=\"Quote\" ng-bind-html=\"::case.notes|escapeHtml|nl2br\"></blockquote>\n  </figure>\n</div>\n");
}]);
angular.module('cla.templates').run(['$templateCache', function($templateCache) {
    $templateCache.put('provider/includes/case_tab_navigation.html',
        "<ul class=\"Tabs Tabs--large\"><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('case_list')}\">\n    <a ui-sref=\"case_list\" class=\"Tabs-tabLink\">Cases</a>\n  </li><!--\n  --><li class=\"Tabs-tab\" ng-class=\"{'is-active': $state.includes('user_list')}\">\n    <a ui-sref=\"user_list\" class=\"Tabs-tabLink\">Users</a>\n  </li><!--\n--></ul>\n");
}]);
'use strict';
(function() {

  angular.module('cla.filters', [])
    .filter('general_date', ['$filter',
      function(filter) {
        // builtin $filter inheritance to create a standardised date filter
        var builtInDateFilter = filter('date');
        return function(date_str) {
          return builtInDateFilter(date_str, 'short');
        };
      }
    ])

    .provider('$escapeHtml', function() {
      this.$get = [function() {
        return function(html) {
          if (typeof html !== 'undefined' && html) {
            var text = document.createTextNode(html);
            var div = document.createElement('div');
            div.appendChild(text);
            return div.innerHTML;
          } else {
            return;
          }
        };
      }];
    })
    .filter('escapeHtml', ['$escapeHtml', function($escapeHtml) {
      return $escapeHtml;
    }])

    .filter('nl2br', [function() {
      return function(text) {
        if (typeof text !== 'undefined' && text) {
          return text.replace(/\n/g, '<br/>');
        } else {
          return;
        }
      };
    }])

    .filter('ordinal', function() {
      return function(input) {
        var s = ['th', 'st', 'nd', 'rd'],
            v = input % 100;
        return input + (s[(v - 20) % 10] || s[v] || s[0]);
      };
    })

    .filter('snakeCaseToHuman', function() {
      return function(input) {
        return input.charAt(0).toUpperCase() + input.substr(1).replace(/_/g, ' ');
      };
    })

    .filter('camelCaseToHuman', function() {
      return function(input) {
        return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
      };
    })

    .filter('ageFromDate', function() {
      return function(input) {
        // return early if not date
        if (!input) { return; }

        var diff = Date.now() - new Date(input.month + '/' + input.day + '/' + input.year).getTime(),
            diffDays = diff / 1000 / (60 * 60 * 24);

        return Math.floor(diffDays / 365.25);
      };
    })

    .filter('dob', function() {
      return function(input) {
        return input ? input.day + '/' + input.month + '/' + input.year : '';
      };
    })

    .filter('capitalize', function() {
      return function(input) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
      };
    })

    .filter('constantByValue', function () {
      return function (lookupVal, constant) {
        return _.find(constant, {value: lookupVal});
      };
    })

    .filter('join', function () {
      return function (list) {
        if (!list) {
          return '';
        }
        return list.join(', ');
      };
    })

    .filter('stripTags', function () {
      return function(input) {
        if(angular.isString(input)) {
          return input.replace(/<\S[^><]*>/g, '');
        }
        return input;
      };
    });

})();

(function(){
  'use strict';

  //ROUTES
  angular.module('cla.routes')
    .config(['AppSettings', '$stateProvider', '$locationProvider', '$urlRouterProvider',
    function(AppSettings, $stateProvider, $locationProvider, $urlRouterProvider) {
      $locationProvider.html5Mode(true);

      var states = angular.module(AppSettings.statesModule).states;

      angular.forEach(states, function (stateDefinition) {
        $stateProvider.state(stateDefinition);
      });

      // handle angular 404s
      $urlRouterProvider
        .otherwise(AppSettings.BASE_URL + 'page-not-found/')
        .rule(function($injector, $location) {
          var path = $location.url();

          // check to see if the path already has a slash where it should be
          if (path[path.length - 1] === '/' || path.indexOf('/?') > -1) {
            return;
          }

          if (path.indexOf('?') > -1) {
            return path.replace('?', '/?');
          }

          return path + '/';
        });
    }]);
})();

'use strict';
(function(){

  angular.module('cla.utils')
    .factory('_', ['$window', function($window){
      return $window._;
    }
  ])
    .factory('lunr', ['$window', function($window){
      return $window.lunr;
    }
  ])
    .factory('Raven', ['$window', function($window){
      return $window.Raven;
    }
  ])
    .factory('Papa', ['$window', function ($window) {
      return $window.Papa;
    }
  ])
    .factory('saveAs', ['$window', function ($window) {
      return $window.saveAs;
    }
  ]);

  angular.module('cla.utils')
    .factory('moment', ['$window', function($window){
      return $window.moment;
    }
  ]);

  angular.module('cla.utils')
    .factory('postal', ['$window', function($window){
      return $window.postal;
    }
  ]);

  angular.module('cla.utils')
    .factory('form_utils', function(){
    return {
      ctrlFormErrorCallback: function($scope, response, form) {
        // response can be response or data (if it needs to be overridden)
        var data = (response.status === undefined) ? response : response.data;

        $scope.errors = {};
        angular.forEach(data, function(errors, field) {
          if (form[field] !== undefined) {
            form[field].$setValidity('server', false);
          }
          if (field === '__all__') {
            form.$setValidity('server', false);
          }
          $scope.errors[field] = errors.join(', ');
        });
      }
    };
  });

  angular.module('cla.utils')
    .factory('url_utils', ['AppSettings', function(AppSettings){
      var url_utils = (function() {
        return {
          BASE_URL: AppSettings.BASE_URL,
          url: function(suffix) {
            return url_utils.BASE_URL + suffix;
          },
          proxy: function(suffix) {
            return url_utils.url('proxy/'+suffix);
          },
          login: '/auth/login/'
        };
      })();

      return url_utils;
    }
  ]);

  angular.module('ErrorCatcher', [])
    .factory('$exceptionHandler', ['Raven', function(Raven) {
    return function(exception, cause) {
      Raven.captureException(exception, cause);
    };
  }]);

  angular.module('cla.utils')
    .factory('goToCase', ['$rootScope', '$state', function($rootScope, $state){
      return function(case_reference) {
        $rootScope.$emit('timer:start', {
          success: function() {
            $state.go('case_detail.edit.diagnosis', {
              'caseref': case_reference
            });
          }
        });
      };
    }]);

  angular.module('cla.utils')
    .factory('goToComplaint', ['$state', function($state) {
      return function(complaint) {
        var complaint_id = angular.isObject(complaint) ? complaint.id : complaint;

        // TODO: does the timer need to start? does dealing with a complaint count as working on a case?
        // c.f. goToCase

        $state.go('complaint', {
          complaint_id: complaint_id
        });
      };
    }]);

  angular.module('cla.utils')
    .factory('appUtils', ['AppSettings', function(AppSettings){
      var version;

      return {
        getVersion: function() {
          if (!version) {
            version = $('script[src*="cla.main"]').attr('src').split('.');
            version = version[version.length - 2];
          }

          return version;
        },

        appName: AppSettings.appName
      };
    }]);
})();


(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('AlternativeHelpCtrl',
      ['$scope', '_', '$stateParams', '$state', 'form_utils', 'kb_providers', 'kb_categories', 'AlternativeHelpService', '$uibModal', 'categories','$q', '$window', 'AppSettings',
        function($scope, _, $stateParams, $state, form_utils, kb_providers, kb_categories, AlternativeHelpService, $uibModal, categories, $q, $window, AppSettings){
          $scope.category = $stateParams.category || null;
          $scope.selected_category = $scope.category;
          $scope.keyword = $stateParams.keyword;
          $scope.currentPage = $stateParams.page || 1;

          $scope.includePath = AppSettings.BASE_URL.substring(1);

          $scope.categories = kb_categories;
          $scope.providers = kb_providers;
          $scope.alternativeHelpService = AlternativeHelpService;

          $scope.law_categories = categories;

          $scope.code = 'IRKB';
          // if search value, focus on element
          if ($scope.keyword) {
            angular.element('[name="keyword"]').focus();
          }

          function updatePage() {
            $state.go('case_detail.alternative_help', {
              'type': $scope.type,
              'page': $scope.currentPage,
              'category': $scope.category,
              'keyword': $scope.keyword
            });
          }

          function isECFRequired() {
            var isOutOfScope = $scope.diagnosis && !$scope.diagnosis.isInScopeTrue(),
              category = $scope.diagnosis.category;
            if (isOutOfScope && category) {
              return _.some($scope.law_categories, {ecf_available: true, code: category});
            }
            return false;
          }

          function showECFModal() {
            return $uibModal.open({
              templateUrl: 'case_detail.alternative_help.ecf.html',
              controller: 'SetECFundCtrl',
              scope: $scope
            }).result;
          }

          function showSurveyModal() {
            return $uibModal.open({
              templateUrl: 'alternative_help_survey.modal.html',
              controller: ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                  $uibModalInstance.dismiss('cancel');
                };
                $scope.continue = function() {
                  $uibModalInstance.close();
                };
              }]
            }).result;
          }

          function showModal() {
            if(isECFRequired()) {
              return showECFModal();
            }
            if($scope.$root.showCallScript) {
              return showSurveyModal();
            }
            return $q.when(true);
          }

          function saveAlternativeHelp(code) {
            return $scope.case.$assign_alternative_help({
              selected_providers: AlternativeHelpService.get_selected_provider_ids(),
              notes: AlternativeHelpService.notes,
              event_code: code
            });
          }

          $scope.getF2fDeepLink = function () {
            if ($scope.personal_details && $scope.personal_details.postcode) {
              var postcode = $window.encodeURIComponent($scope.personal_details.postcode);
              return 'https://find-legal-advice.justice.gov.uk/?postcode=' + postcode;
            }
            return 'http://find-legal-advice.justice.gov.uk/';
          };

          $scope.pageChanged = function(newPage) {
            $scope.currentPage = newPage;
            updatePage();
          };

          $scope.changeCategory = function (category) {
            $scope.category = parseInt($scope.category) === parseInt(category) ? null : category;
            $scope.currentPage = 1;
            updatePage();
          };

          $scope.searchProviders = function (query) {
            $scope.currentPage = 1;
            $scope.keyword = query;
            updatePage();
          };

          $scope.decline_help = function() {
            return showModal();
          };

          $scope.toggleProvider = function (provider) {
            if (AlternativeHelpService.selected_ids[provider.id]) {
              AlternativeHelpService.selected_providers[provider.id] = provider;
            } else if (!AlternativeHelpService.selected_ids[provider.id]) {
              delete AlternativeHelpService.selected_providers[provider.id];
            }
          };

          $scope.submit = function (code) {
            code = code || this.code;
            showModal().then(function () {
              saveAlternativeHelp(code)
                .then(function () {
                  AlternativeHelpService.clear();
                  $state.go('case_list');
                }, function(response){
                  console.log('something went wrong', response);
                });
            });
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailEditCtrl',
      ['$scope', 'AlternativeHelpService', 'AppSettings',
        function($scope, AlternativeHelpService, AppSettings){
          // when viewing coming back to the details view
          // clear out the Alternative Help selections.
          AlternativeHelpService.clear();

          $scope.diagnosisIcon = function () {
            return $scope.diagnosis.isInScopeTrue() ? 'Icon Icon--right Icon--solidTick Icon--green' : ($scope.diagnosis.isInScopeFalse() ? 'Icon Icon--right Icon--solidCross Icon--red' : '');
          };
          $scope.eligibilityIcon = function () {
            return $scope.eligibility_check.isEligibilityTrue() ? 'Icon Icon--right Icon--solidTick Icon--green' : ($scope.eligibility_check.isEligibilityFalse() ? 'Icon Icon--right Icon--solidCross Icon--red' : '');
          };

          $scope.includePath = AppSettings.BASE_URL.substring(1);
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'diagnosis', 'personal_details', 'eod_details', '$uibModal', 'MatterType', 'History', 'log_set', 'hotkeys', '$state', 'AppSettings', 'ClaPostalService',
        function($rootScope, $scope, $case, $eligibility_check, $diagnosis, $personal_details, eod_details, $uibModal, MatterType, History, log_set, hotkeys, $state, AppSettings, ClaPostalService){
          $scope.caseListStateParams = History.caseListStateParams;
          $scope.case = $case;
          $scope.eod_details = eod_details;
          $scope.log_set = log_set;
          $scope.eligibility_check = $eligibility_check;
          $scope.diagnosis = $diagnosis;
          $scope.personal_details = $personal_details;
          $scope.appName = AppSettings.appName;

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
          });

          hotkeys
            .bindTo($scope)
            .add({
              combo: 'g d',
              description: 'Scope diagnosis',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.edit.diagnosis');
              }
            })
            .add({
              combo: 'g f',
              description: 'Financial assessment',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.edit.eligibility');
              }
            })
            .add({
              combo: 'g a',
              description: 'Assign provider',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.assign');
              }
            })
            .add({
              combo: 'g h',
              description: 'Alternative help',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.alternative_help');
              }
            })
            .add({
              combo: 'g s',
              description: 'Suspend a case',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.suspend');
              }
            })
            .add({
              combo: 'g e',
              description: 'Add expressions of dissatisfaction',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);
                $state.go('case_detail.eod_details');
              }
            });

          // modelsEventManager.onEnter();
          // $scope.$on('$destroy', function () {
          //   modelsEventManager.onExit();
          // });
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseListCtrl',
      ['$rootScope', '$scope', 'cases', 'person', '$stateParams', '$state', 'Case', 'History', 'goToCase', 'hotkeys', 'historicCases', 'ClaPostalService',
        function($rootScope, $scope, cases, person, $stateParams, $state, Case, History, goToCase, hotkeys, historicCases, ClaPostalService) {
          // PARAMS
          $scope.searchParams = angular.extend({}, $stateParams);
          $scope.searchParams.ordering = $scope.searchParams.ordering || '-priority';
          $scope.searchParams.page = $scope.searchParams.page || 1;

          $scope.cases = cases;
          $scope.person = person;
          $scope.historicCases = historicCases;
          $scope.pagesObj = [];
          $scope.selectedPage = $scope.searchParams.page;

          var totalPages = cases.count / 20;
          for (var i = 1; i < totalPages + 1; i+=1) {
            $scope.pagesObj.push(i);
          }


          // SEARCH ACTIONS

          function _updatePage(options) {
            $state.go('case_list', $scope.searchParams, options);
          }

          $scope.pageChanged = function(newPage) {
            $scope.searchParams.page = newPage;
            _updatePage();
          };

          $scope.filterByPerson = function(person_ref) {
            History.latestSearchParams = angular.extend({}, $scope.searchParams);

            $scope.searchParams = {
              person_ref: person_ref
            };
            _updatePage({inherit: false});
          };

          $scope.backToLatestSearch = function() {
            $scope.searchParams = History.latestSearchParams || {};
            _updatePage({inherit: false});
          };

          $scope.resetSearch = function() {
            $scope.searchParams = {};
            _updatePage({inherit: false});
          };

          // FILTER ACTIONS

          $scope.filterCases = function(onlyVal){
            $scope.searchParams.page = 1;
            $scope.searchParams.only = onlyVal;
            _updatePage();
          };

          $scope.filterClass = function(onlyVal) {
            if (onlyVal === ($scope.searchParams.only || '')) {
              return 'is-selected';
            }

            return '';
          };

          // SORT ACTIONS

          $scope.sortToggle = function(currentOrderProp){
            if (currentOrderProp === $scope.searchParams.ordering) {
              $scope.searchParams.ordering = '-' + currentOrderProp;
            } else {
              $scope.searchParams.ordering = currentOrderProp;
            }
            $scope.searchParams.page = 1;
            _updatePage();
          };

          $scope.sortClass = function(orderProp) {
            if ($scope.searchParams.ordering === orderProp) {
              return 'u-sortAsc';
            } else if ($scope.searchParams.ordering === '-' + orderProp) {
              return 'u-sortDesc';
            }
          };

          // Classes
          $scope.rowClass = function (_case) {
            return {
              'is-rejected': _case.rejected, // OPERATOR
              'is-closed': _case.provider_closed, // PROVIDER
              'is-complete': _case.provider_accepted && !_case.provider_closed, // PROVIDER
              'is-new': _case.provider_viewed === null && _case.provider_accepted === null && _case.provider_closed === null // PROVIDER
            };
          };

          $scope.opCaseClass = function (_case) {
            var className = '';
            switch (_case.source) {
              case 'PHONE':
                className = 'Icon--call';
                break;
              case 'WEB':
                className = 'Icon--form';
                break;
              case 'SMS':
                className = 'Icon--sms';
                break;
              case 'VOICEMAIL':
                className = 'Icon--voicemail';
                break;
            }
            return className;
          };

          $scope.provCaseClass = function (_case) {
            if (_case.provider_viewed === undefined) {
              return false;
            }
            if (!_case.provider_viewed && !_case.provider_accepted && !_case.provider_closed) {
              return 'Icon--folderNew';
            }
            if (_case.provider_accepted && !_case.provider_closed) {
              return 'Icon--folderAccepted';
            }
            if (_case.provider_closed) {
              return 'Icon--folderClosed';
            }
            if (_case.provider_viewed) {
              return 'Icon--folder';
            }
            return false;
          };

          // ADD / EDIT CASE ACTIONS
          $scope.isCallback = function (_case) {
            var callbackCodes = ['CB1', 'CB2', 'CB3'];
            if (callbackCodes.indexOf(_case.outcome_code) !== -1) {
              return true;
            }
            return false;
          };

          $scope.addCase = function(person_ref) {
            var saveParams = {
              personal_details: person_ref || null
            };

            $rootScope.$emit('timer:start', {
              success: function() {
                new Case(saveParams).$save(function (data) {
                  $state.go('case_detail.edit.diagnosis', {caseref: data.reference});
                });
              }
            });
          };

          // keyboard shortcut to create case
          hotkeys
            .bindTo($scope)
            .add({
              combo: 'c c',
              description: 'Create case',
              callback: function(e, hotkey) {
                ClaPostalService.publishHotKey(hotkey);

                $scope.addCase($scope.person.reference);
              }
            });

          $scope.goToCase = goToCase;

          // checking the time after the template as been rendered
          $scope.$evalAsync(function() {
            $rootScope.$emit('timer:check');
            $rootScope.$emit('timer:stop');
          });

        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CSVUploadCtrl',
    ['$scope', '$state', '$stateParams', 'providers', 'csvuploads', 'CSVUpload', 'moment', 'flash', 'Papa', 'saveAs',
      function($scope, $state, $stateParams, providers, csvuploads, CSVUpload, Moment, flash, Papa, saveAs) {

        function updatePage() {
          $state.go($state.current.name, {
            page: $scope.currentPage,
            provider: $scope.provider
          }, {
            reload: true
          });
        }

        function downloadCSV(csv) {
          var blob = new Blob([Papa.unparse(csv.body)], {type: 'text/csv'});
          var filename = ''+csv.provider+'_'+csv.month+'.csv';
          saveAs(blob, filename);
        }

        function monthRange(start, end) {
          var range = [];
          for (var i = start.clone(); i < end; i= i.clone().add(1, 'months') ) {
            range.push({name: i.format('MMM YYYY'), value: i.format('YYYY-MM-DD')});
          }
          return range;
        }

        function handleError(err) {

          if (err.status === 409) {
            flash('error', err.data.detail);
            return;
          }
          if (err.status === 400 && err.data && err.data.body) {
            $scope.errors = err.data.body;
          } else {
            $scope.errors = err.data;
          }
        }

        $scope.currentPage = $stateParams.page || 1;

        $scope.pageChanged = function(newPage) {
          $scope.currentPage = newPage;
          updatePage();
        };

        $scope.uploads = csvuploads;
        var firstOfThisMonth = new Moment().local().startOf('month');
        var twelveMonthsAgo = firstOfThisMonth.clone().subtract(12, 'months');

        $scope.validMonths = monthRange(twelveMonthsAgo, firstOfThisMonth);

        $scope.submit = function () {
          var upload = new CSVUpload({
            comment: '',
            body: $scope.csvFile,
            month: $scope.month
          });
          upload.$post().then(function () {
            $scope.csvFile = null;
            updatePage();
          }, handleError);
        };

        $scope.provider = ($stateParams.provider && parseInt($stateParams.provider, 10)) || null;
        var providerIDSet = [];
        $scope.providers = providers.filter(function(provider) {
          if(providerIDSet.indexOf(provider.id) === -1) {
            providerIDSet.push(provider.id);
            return true;
          }
          return false;
        });

        $scope.submitFilters = function() {
          $scope.pageChanged(1);
        };

        $scope.download = function(csv) {
          csv.$get().then(downloadCSV, handleError);
        };

        $scope.overwrite = function(newCsv, oldCsv) {
          oldCsv.body = newCsv;
          oldCsv.$put().then(updatePage, handleError);
        };
      }
    ]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisCtrl',
      ['$scope', 'Category', 'postal',
        function($scope, Category, postal) {
          // updates the state of case.diagnosis_state after each save
          function saveCallback(data) {
            $scope.case.diagnosis_state = data.state;

            if (!$scope.diagnosis.isInScopeUnknown()) {
              // refreshing the logs
              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
            }
          }

          // creates a new diagnosis
          $scope.createDiagnosis = function () {
            if (!$scope.case.diagnosis) {
              // creates the diagnosis object if it doesn't exist
              $scope.diagnosis.$save({
                'case_reference': $scope.case.reference
              }, function(data) {
                $scope.case.diagnosis = data.reference;
              });
            }
          };

          $scope.moveDown = function() {
            $scope.diagnosis.$move_down({
              'case_reference': $scope.case.reference
            }, saveCallback);
          };

          $scope.moveUp = function() {
            $scope.diagnosis.$move_up({
              'case_reference': $scope.case.reference
            }, saveCallback);
          };

          $scope.delete = function() {
            $scope.diagnosis.$delete({'case_reference': $scope.case.reference}, function() {
              $scope.case.diagnosis = null;

              // refreshing the logs
              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
            });
          };

          // if choices.length === 1 => check it by default
          $scope.$watch('diagnosis.choices', function(newVal) {
            if (newVal && newVal.length === 1) {
              $scope.diagnosis.current_node_id = newVal[0].id;
            }
          });

          $scope.$watch('diagnosis.category', function(newVal) {
            if (!newVal) {
              $scope.category = null;
            } else {
              Category.get({code: $scope.diagnosis.category}).$promise.then(function(data) {
                $scope.category = data;
              });
            }
          });
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('EligibilityCheckCtrl',
      ['$scope', 'Category', '$stateParams', 'flash', '$state', 'postal', 'moment', '_', 'IncomeWarningsService', 'SPECIFIC_BENEFITS', '$timeout',
        function($scope, Category, $stateParams, flash, $state, postal, Moment, _, IncomeWarningsService, SPECIFIC_BENEFITS, $timeout){
          $scope.category_list = Category.query();
          $scope.formDidChange = false;
          // set nass benefits to FALSE by default
          $scope.eligibility_check.on_nass_benefits = $scope.eligibility_check.on_nass_benefits || false;

          // income warnings
          postal.subscribe({
            channel: 'IncomeWarnings',
            topic: 'update',
            callback: function(data) {
              $scope.incomeWarnings = data.warnings;
            }
          });

          IncomeWarningsService.setEligibilityCheck($scope.eligibility_check);
          $scope.incomeWarnings = IncomeWarningsService.warnings;
          $scope.hasIncomeWarnings = function () {
            return _.size($scope.incomeWarnings) > 0;
          };

          $scope.warnings = {};
          $scope.oneMonthAgo = new Moment().add(1, 'days').subtract(1, 'months').format('Do MMMM, YYYY');
          var all_sections = [{
              title: 'Details',
              state: 'case_detail.edit.eligibility.details',
              template: 'includes/eligibility.details.html'
            }, {
              title: 'Finances',
              state: 'case_detail.edit.eligibility.finances',
              template: 'includes/eligibility.finances.html'
            }, {
              title: 'Income',
              state: 'case_detail.edit.eligibility.income',
              template: 'includes/eligibility.income.html'
            }, {
              title: 'Expenses',
              state: 'case_detail.edit.eligibility.expenses',
              template: 'includes/eligibility.expenses.html'
            }
          ];

          $scope.specificBenefitsOptions = SPECIFIC_BENEFITS;

          var passported = function() {
            var _radio = $('#id_your_details-passported_benefits_0').get(0);
            if (_radio) {
              return _radio.checked;
            }
            var _passported = $scope.eligibility_check.on_passported_benefits;
            if (_passported === '0') {
              _passported = false;
            }
            return !!_passported;
          };

          var tabHideRules = {
            'Details': [],
            'Finances': [],
            'Income': [passported],
            'Expenses': [passported]
          };

          var isRequired = function (section) {
            var isFalse = function (fn) { return !fn(); };
            var r = tabHideRules[section.title].every(isFalse);
            return r;
          };

          $scope.hasSpecificBenefits = function () {
            return $scope.eligibility_check.specific_benefits !== undefined && $scope.eligibility_check.specific_benefits !== null && typeof $scope.eligibility_check.specific_benefits === 'object';
          };

          $scope.benefitChange = function () {
            var passported = _.some($scope.eligibility_check.specific_benefits, function (benefit) {
              return benefit === true || benefit === '1';
            });

            if (passported) {
              $scope.eligibility_check.on_passported_benefits = true;
            } else {
              $scope.eligibility_check.on_passported_benefits = false;
            }

            $timeout(function () {
              $scope.updateTabs();
            });
          };

          $scope.updateTabs = function () {
            $scope.sections = all_sections.filter(isRequired);
          };
          $scope.updateTabs();

          var monthly = function (amount) {
            return {'per_interval_value': amount, 'interval_period': 'per_month'};
          };

          var setDetailsDefaults = function (ec) {
            ec.has_partner = false;
            ec.is_you_or_your_partner_over_60 = false;
            ec.specific_benefits = {
              universal_credit: false,
              income_support: false,
              job_seekers_allowance: false,
              pension_credit: false,
              employment_support: false
            };
          };

          var setSavingsDefaults = function (ec) {
            [ec.you, ec.partner].map(function (person) {
              person.savings = {
                bank_balance: 0,
                investment_balance: 0,
                childcare: 0,
                asset_balance: 0,
                credit_balance: 0
              };
            });
          };

          var setIncomeDefaults = function (ec) {
            [ec.you.income, ec.partner.income].map(function (person) {
              person.earnings = monthly(0);
              person.other_income = monthly(0);
              person.self_employed = false;
              person.total = 0;
              person.self_employment_drawings = monthly(0);
              person.benefits = monthly(0);
              person.tax_credits = monthly(0);
              person.child_benefits = monthly(0);
              person.maintenance_received = monthly(0);
              person.pension = monthly(0);
            });
            ec.dependants_young = 0;
            ec.dependants_old = 0;
          };

          var setExpensesDefaults = function (ec) {
            [ec.you.deductions, ec.partner.deductions].map(function (person) {
              person.income_tax = monthly(0);
              person.mortgage = monthly(0);
              person.childcare = monthly(0);
              person.rent = monthly(0);
              person.maintenance = monthly(0);
              person.criminal_legalaid_contributions = 0;
              person.total = 0;
              person.national_insurance = monthly(0);
            });
          };

          var defaultsSetters = {
            'Income': setIncomeDefaults,
            'Expenses': setExpensesDefaults
          };

          $scope.setDefaultsInNonRequiredSections = function (eligibility_check) {
            all_sections.map(function (section) {
              if (!isRequired(section) && section.title in defaultsSetters) {
                defaultsSetters[section.title](eligibility_check);
              }
            });
          };

          $scope.skipMeansTest = function () {
            setDetailsDefaults($scope.eligibility_check);
            setSavingsDefaults($scope.eligibility_check);
            setIncomeDefaults($scope.eligibility_check);
            setExpensesDefaults($scope.eligibility_check);
            $scope.save();
          };

          $scope.hasSMOD = function () {
            return $scope.eligibility_check.category === 'family' || $scope.eligibility_check.category === 'debt';
          };

          $scope.hasPartner = function () {
            return $scope.eligibility_check.has_partner;
          };

          $scope.tabWarningClass = function (section) {
            var incomeWarnings = $scope.incomeWarnings;
            var className = '';

            switch (section.title) {
              case 'Income':
                if (incomeWarnings.zeroIncome || incomeWarnings.negativeDisposable || incomeWarnings.housing) {
                  className = 'is-warning';
                }
                break;
              case 'Expenses':
                if (incomeWarnings.negativeDisposable || incomeWarnings.housing) {
                  className = 'is-warning';
                }
                break;
            }

            return className;
          };

          $scope.fieldWarningClass = function (warnings) {
            var className = '';

            angular.forEach(warnings, function (warning) {
              if ($scope.incomeWarnings[warning]) {
                className = 'is-warning';
              }
            });

            return className;
          };

          $scope.isComplete = function (section) {
            var emptyInputs = angular.element('#' + section).find('input, select, textarea').filter(function() {
              var $this = angular.element(this),
                  type = $this.attr('type');

              if (type === 'radio' || type === 'checkbox') {
                return angular.element('[name=' + $this.attr('name') + ']:checked').val() === undefined;
              } else {
                return $this.val() === '';
              }
            });

            return !emptyInputs.length;
          };

          $scope.currentState = function () {
            var current = 'case_detail.edit.eligibility.details';
            angular.forEach($scope.sections, function(section) {
              if ($state.includes(section.state)) {
                current = section.state;
              }
            });
            return current;
          };

          $scope.gotoSection = function (section) {
            // auto-save eligibility check when switching tabs if form changed
            if($scope.formDidChange) {
              // can't use $dirty of form as it doesn't change at the right time
              $scope.save();
            }
            $state.go(section.state);
          };

          $scope.save = function () {
            $scope.setDefaultsInNonRequiredSections($scope.eligibility_check);
            $scope.eligibility_check.$update($scope.case.reference, function (data) {
              $scope.formDidChange = false;
              $scope.case.eligibility_check = data.reference;
              $scope.case.$get();
              $scope.eligibility_check.validate($scope.case.reference).then(function (resp) {
                $scope.warnings = resp.data.warnings;
              });

              // updates the state of case.eligibility_state after each save
              $scope.case.state = data.state;

              // publish eligibility save
              postal.publish({
                channel: 'EligibilityCheck',
                topic: 'save',
                data: {
                  eligibilityCheck: data
                }
              });

              // fire a save notification
              flash('success', 'The means test has been saved. The current result is <strong>' + $scope.eligibilityText(data.state) + '</strong>');

              // refreshing the logs
              postal.publish({
                channel: 'models',
                topic: 'Log.refresh'
              });
            });
          };

          $scope.removeProperty = function (index) {
            $scope.eligibility_check.property_set.splice(index, 1);
          };
          $scope.addProperty = function () {
            var property = {};

            if (typeof $scope.eligibility_check.property_set === 'undefined') {
              $scope.eligibility_check.property_set = [];
            }
            // if not SMOD, set to not disputed
            if (!$scope.hasSMOD()) {
              property.disputed = 0;
            }

            $scope.eligibility_check.property_set.push(property);
          };

          $scope.eligibilityText = function (eligible) {
            return eligible === 'yes' ? 'eligible for Legal Aid' : (eligible === 'no' ? 'not eligible for Legal Aid' : 'unknown');
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LayoutCtrl',
      ['$rootScope', '$scope', '$window', 'History', 'user', 'hotkeys', 'localStorageService', 'ClaPostalService',
        function($rootScope, $scope, $window, History, user, hotkeys, localStorageService, ClaPostalService){
          var offStateChange = $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
            if (from.name === 'case_list') {
              History.caseListStateParams = fromParams;
            } else if(from.name === 'complaints_list') {
              History.complaintsListStateParams = fromParams;
            }

            if (to.parent !== 'case_detail.edit') {
              $window.scrollTo(0,0);
            }
          });

          var numberFields = angular.element('body');
          numberFields.on('mousewheel', ':input[type=number]',function () {
            angular.element(this).blur();
          });

          $scope.$on('$destroy', function () {
            offStateChange();
            numberFields.off('mousewheel');
          });

          $rootScope.user = user;

          hotkeys.add({
            combo: 's c',
            description: 'Search cases',
            callback: function(e, hotkey) {
              e.preventDefault();

              ClaPostalService.publishHotKey(hotkey);

              angular.element('#search [name="q"]').focus();
            }
          });

          hotkeys.add({
            combo: '$',
            description: 'Show call scripts',
            callback: function(e, hotkey) {
              e.preventDefault();

              ClaPostalService.publishHotKey(hotkey);

              $rootScope.showCallScript = !$rootScope.showCallScript;
              localStorageService.set('showCallScript', $rootScope.showCallScript);
            }
          });
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('LogListCtrl',
    ['$scope', '$uibModal',
      function ($scope, $uibModal) {
        $scope.logSet = [];

        $scope.$watch('log_set.data', function(newVal) {
          // log set grouping
          var currentTimer = null;
          $scope.logSet = [];
          angular.forEach(newVal, function(log) {
            if (!log.timer) {
              $scope.logSet.push([log]);
            } else {
              if (log.timer !== currentTimer) {
                currentTimer = log.timer;
                $scope.logSet.push([log]);
              } else {
                var ll = $scope.logSet[$scope.logSet.length-1];
                ll.push(log);
                $scope.logSet[$scope.logSet.length-1] = ll;
              }
            }
          });
        });

        $scope.showDiagnosisSummary = function(log) {
          $uibModal.open({
            templateUrl: 'includes/diagnosis.summary.modal.html',
            controller: ['$scope', '$uibModalInstance', 'log', 'Diagnosis',
              function($scope, $uibModalInstance, log, Diagnosis) {
                $scope.diagnosis = new Diagnosis(log.patch);
                $scope.diagnosisTitle = function () {
                  if ($scope.diagnosis.isInScopeTrue()) {
                    return 'In scope';
                  }

                  if ($scope.diagnosis.isInScopeFalse()) {
                    return 'Not in scope';
                  }

                  return 'Incomplete Diagnosis';
                };
                $scope.diagnosisTitleClass = function () {
                  if ($scope.diagnosis.isInScopeTrue()) {
                    return 'Icon Icon--lrg Icon--solidTick Icon--green';
                  }

                  if ($scope.diagnosis.isInScopeFalse()) {
                    return 'Icon Icon--lrg Icon--solidCross Icon--red';
                  }

                  return 'Icon Icon--lrg';
                };
                $scope.close = function () {
                  $uibModalInstance.dismiss('cancel');
                };
              }
            ],
            resolve: {
              'log': function () {
                return log;
              }
            }
          });
        };
      }
    ]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('NotificationCtrl',
      ['$scope', 'cla.notification',
        function($scope, notification) {
          notification.list().then(function (notifications) {
            $scope.notifications = notifications;
          });
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('OutcomesModalCtl',
      ['$scope', 'case', 'eod_details', 'event_key', 'outcome_codes', 'notes', 'tplVars', '$uibModalInstance', '$timeout', 'flash', 'postal', 'Feedback', 'Complaint',
        function($scope, _case, eod_details, event_key, outcome_codes, notes, tplVars, $uibModalInstance, $timeout, flash, postal, Feedback, Complaint) {
          // template vars
          tplVars = angular.extend({
            'title': 'Outcome code'
          }, tplVars);
          tplVars.buttonText = tplVars.buttonText || tplVars.title;
          $scope.tplVars = tplVars;
          $scope.outcome_codes = outcome_codes;
          $scope.selected = {};
          $scope.selected.notes = notes || '';
          $scope.feedback_allowed = (event_key === 'reject_case');

          if(eod_details !== null) {
            if(_case.complaint_flag) {
              $scope.ircb_escalates = 'escalated';
            } else if(eod_details.isEODSet()) {
              $scope.ircb_escalates = 'will_escalate';
            } else {
              $scope.ircb_escalates = 'cant_escalate';
            }
          }

          // focus on search field on open
          $uibModalInstance.opened.then(function () {
            $timeout(function () {
              angular.element('[name="outcome-modal-code-search"]').focus();
            }, 50);
          });

          // on save event
          var onSuccess = function (response) {
            $scope.$close(response);
          };
          var onFail = function (response) {
            $scope.errors = {};
            angular.forEach(response.data, function (errors, field) {
              if (Array.isArray(errors)) {
                $scope.errors[field] = errors.join(', ');
              } else {
                $scope.errors[field] = errors;
              }
            });
          };
          var saveEvent = function () {
            function doSave() {
              _case['$' + event_key]({
                event_code: $scope.selected.outcome_code,
                notes: $scope.selected.notes
              }).then(onSuccess, onFail);
            }
            if(eod_details !== null && $scope.ircb_escalates === 'will_escalate' && $scope.selected.outcome_code === 'IRCB') {
              var complaint = new Complaint({
                eod: eod_details.reference,
                // copy IRCB notes into complaint description (EOD notes go into created log event)
                description: $scope.selected.notes ? 'IRCB notes: ' + $scope.selected.notes : ''
              });
              complaint.$update(function() {
                _case.complaint_flag = true;  // could go _case.$get but that might wipe other changes

                postal.publish({
                  channel: 'Complaint',
                  topic: 'save',
                  data: complaint
                });
                flash('success', 'EOD escalated to complaint');
                doSave();
              }, function() {
                flash('error', 'EOD not escalated to complaint');
                doSave();
              });
            } else {
              doSave();
            }
          };

          $scope.submit = function(isValid) {
            if (isValid) {
              if ($scope.selected.issue) {
                var feedback_resource = new Feedback({
                  case: _case.reference,
                  issue: $scope.selected.issue,
                  comment: $scope.selected.notes
                });

                feedback_resource.$save(function () {
                  saveEvent();
                }, onFail);
              } else {
                saveEvent();
              }
            }
          };

          $scope.cancel = function () {
            $scope.$dismiss('cancel');
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('PersonalDetailsCtrl',
      ['$scope', '_', 'personal_details', 'adaptation_details', 'thirdparty_details', 'form_utils', 'ADAPTATION_LANGUAGES', 'THIRDPARTY_REASON', 'THIRDPARTY_RELATIONSHIP', 'EXEMPT_USER_REASON', 'CASE_SOURCE', 'RESEARCH_CONTACT_VIA', 'adaptations_metadata', 'mediacodes', '$q', 'flash', 'postal',
        function($scope, _, personal_details, adaptation_details, thirdparty_details, form_utils, ADAPTATION_LANGUAGES, THIRDPARTY_REASON, THIRDPARTY_RELATIONSHIP, EXEMPT_USER_REASON, CASE_SOURCE, RESEARCH_CONTACT_VIA, adaptations_metadata, mediacodes, $q, flash, postal){
          $scope.personal_details = personal_details;
          $scope.adaptations = adaptation_details;
          $scope.third_party = thirdparty_details;
          $scope.language_options = ADAPTATION_LANGUAGES;
          $scope.reasons = THIRDPARTY_REASON;
          $scope.relationships = THIRDPARTY_RELATIONSHIP;
          $scope.sources = CASE_SOURCE;
          $scope.exempt_user_reason_choices = EXEMPT_USER_REASON;
          $scope.contact_for_research_via_choices = RESEARCH_CONTACT_VIA;

          $scope.language = {};
          if ($scope.adaptations.language === 'WELSH') {
            $scope.language.welsh_override = true;
            $scope.language.disable = true;
          }

          $scope.selected_adaptations = [];
          $scope.adaptation_flags = {};
          angular.forEach(adaptations_metadata.actions.POST, function (item, i) {
            // add available flags to array
            if (item.type === 'boolean') {
              $scope.adaptation_flags[i] = item.label;
            }
            // add server data to local array
            if ($scope.adaptations[i] === true) {
              $scope.selected_adaptations.push(i);
            }
          });

          $scope.getAdaptationLabel = function (code) {
            return $scope.adaptation_flags[code];
          };

          $scope.getLanguageLabel = function (code) {
            var obj = _.findWhere($scope.language_options, {value: code});
            return obj ? obj.text : null;
          };

          $scope.getExemptReasonByCode = function (code) {
            var matches = $scope.exempt_user_reason_choices.filter(function (lookup) {
              return lookup.value === code;
            });
            if (matches.length) {
              return matches[0];
            }
          };

          $scope.exemptChange = function (value) {
            $scope.is_exempt = value;
          };
          // trigger on first load
          $scope.exemptChange($scope.case.exempt_user);

          $scope.researchChange = function (value) {
            $scope.contact_for_research = value;
          };
          // trigger on first load
          $scope.researchChange($scope.personal_details.contact_for_research);

          var media_codes = mediacodes.map(function (mc) {
            var opt = {};

            opt.code = mc.code;
            opt.label = mc.name;
            opt.group = mc.group;

            return opt;
          });
          $scope.media_codes = _.sortBy(media_codes, 'group');

          if ($scope.case.media_code) {
            $scope.media_code = $scope.case.media_code;
          }

          if ($scope.case.source) {
            $scope.source = $scope.case.source;
          }

          $scope.mediaCode = function (code) {
            var matches = media_codes.filter(function (mediacode) {
              return mediacode.code === code;
            });
            if (matches.length) {
              return matches[0];
            }
          };

          $scope.getDisplayLabel = function(value, list) {
            var v = _.find(list, function(r) { return r.value === value;});
            if (v !== undefined) {
              v = v.text;
            }
            return v;
          };

          $scope.validate = function (isValid) {
            if (isValid) {
              return true;
            } else {
              return 'false';
            }
          };

          $scope.validateRadio = function (value) {
            if (value !== undefined) {
              return true;
            } else {
              return 'This field is required';
            }
          };

          $scope.relationshipChange = function (value) {
            $scope.is_legal_advisor = value === 'LEGAL_ADVISOR';
          };
          // trigger on first load
          $scope.relationshipChange($scope.third_party.personal_relationship);

          $scope.spokenOptions = [
            {value: true, text: 'Yes'},
            {value: false, text: 'No'}
          ];
          $scope.spokenWithToggle = function (value) {
            $scope.show_reason = value === undefined || value === null ? false : !value;
            $scope.passphrase_required = !$scope.show_reason;
          };
          // trigger on first load
          $scope.spokenWithToggle($scope.third_party.spoke_to);

          $scope.toggleWelsh = function (value) {
            $scope.language.disable = value ? false : true;
          };

          $scope.showPersonalDetails = function(form, isNew) {
            form.$show();
            $scope.personal_details_frm_visible = true;

            var topic = isNew ? 'create' : 'edit';
            postal.publish({channel: 'Person', topic: topic});
          };

          $scope.cancelPersonalDetails = function (form) {
            form.$cancel();
            $scope.language.disable = $scope.adaptations.language === 'WELSH';
            $scope.personal_details_frm_visible = false;

            postal.publish({channel: 'Person', topic: 'cancel'});
          };

          $scope.showThirdParty = function(form, isNew) {
            form.$show();
            $scope.add_thirdparty = true;

            var topic = isNew ? 'create' : 'edit';
            postal.publish({channel: 'ThirdParty', topic: topic});
          };

          $scope.cancelThirdParty = function(form) {
            form.$cancel();
            $scope.add_thirdparty = false;
            $scope.spokenWithToggle($scope.third_party.spoke_to);

            postal.publish({channel: 'ThirdParty', topic: 'cancel'});
          };

          $scope.searchPersonOptions = {
            minimumInputLength: 3,
            ajax: {
              data: function (term) {
                return {
                  query: term
                };
              },
              quietMillis: 500,
              transport: function(queryParams) {
                return $scope.case.$search_for_personal_details(
                    queryParams.data.query
                  ).then(queryParams.success);
              },
              results: function (data) {
                var text, extra_text, results;

                results = data.data.map(function(person) {
                  text = person.full_name;
                  if (person.postcode || person.dob) {
                    extra_text = [];
                    if (person.postcode) {
                      extra_text.push(person.postcode);
                    }
                    if (person.dob) {
                      extra_text.push([person.dob.day, person.dob.month, person.dob.year].join('-'));
                    }
                    text += ' ('+extra_text.join(', ')+')';
                  }
                  return {id: person.reference, text: text};
                });
                return {results: results};
              }
            },
            initSelection: function(element, callback) {
              callback({id: element.val(), text: element.select2('data').text});
            }
          };

          $scope.$watch('person_q', function(val) {
            if (val && val.id) {
              var pd_ref = val.id,
                  pd_full_name = val.text;

              if (confirm('Are you sure you want to link this case to '+pd_full_name+'? \n\nThis operation cannot be undone.')) {
                $scope.case.$link_personal_details(pd_ref).then(function() {
                  $scope.case.personal_details = pd_ref;

                  personal_details.$get().then(function() {
                    flash('Case linked to '+pd_full_name);

                    postal.publish({channel: 'Person', topic: 'link'});
                  });
                });
              } else {
                $scope.person_q = '';
              }
            }
          });

          $scope.savePersonalDetails = function(form) {
            var pdPromise = $q.defer(),
                adaptationsPromise = $q.defer(),
                mcPromise = $q.defer(),
                selected_adaptation = this.selected_adaptations;

            if ($scope.language.welsh_override) {
              $scope.adaptations.language = 'WELSH';
            }

            // save personal details
            $scope.personal_details.$update($scope.case.reference, function (data) {
              if (!$scope.case.personal_details) {
                $scope.case.personal_details = data.reference;
              }

              postal.publish({channel: 'Person', topic: 'save'});

              pdPromise.resolve();
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.personal_details = personal_details;
              pdPromise.reject('fail');
            });

            // set adaptations
            angular.forEach($scope.adaptation_flags, function (label, key) {
              $scope.adaptations[key] = selected_adaptation.indexOf(key) !== -1;
            });
            // save adaptations
            $scope.adaptations.$update($scope.case.reference, function (data) {
              if (!$scope.case.adaptation_details) {
                $scope.case.adaptation_details = data.reference;
              }
              adaptationsPromise.resolve();
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.adaptations = adaptation_details;
              adaptationsPromise.reject();
            });

            // save media code & exempt_user
            $scope.case.media_code = this.media_code;
            $scope.case.source = this.source;

            $scope.case.$patch().then(function () {
              $scope.media_code = $scope.case.media_code !== null ? $scope.case.media_code : undefined;
              mcPromise.resolve();
            }, function(err){
              form_utils.ctrlFormErrorCallback($scope, err, form);
              mcPromise.reject(err);
            });

            $scope.personal_details_frm_visible = false;

            return $q.all([pdPromise.promise, adaptationsPromise.promise, mcPromise.promise]);
          };

          $scope.saveThirdParty = function(form) {
            $scope.third_party.$update($scope.case.reference, function (data) {
              if (!$scope.case.thirdparty_details) {
                $scope.case.thirdparty_details = data.reference;
              }

              postal.publish({channel: 'ThirdParty', topic: 'save'});
            }, function(response){
              form_utils.ctrlFormErrorCallback($scope, response, form);
              $scope.third_party = thirdparty_details;
            });
            return true;
          };

          // Prevent user from navigating away when Personal Details form is being edited

          var unloadPrefixMsg = 'The Personal Details form is being edited.';

          $scope.$on('$stateChangeStart', function(evt, toState) {
            if(!$scope.personal_details_frm_visible || toState.name !== 'case_list') {
              return;
            }
            var answer = confirm(unloadPrefixMsg + '\n\nAre you sure you want to leave this page?');
            if (answer) {
              window.onbeforeunload = null;
            } else {
              evt.preventDefault();
            }
          });

          window.onbeforeunload = function() {
            if($scope.personal_details_frm_visible) {
              return unloadPrefixMsg;
            }
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SearchCtrl',
      ['$scope', '$state', '$location',
        function($scope, $state, $location) {
          $scope.$on('$locationChangeSuccess', function(){
            var searchList = ($state.current.name.indexOf('complaint') !== -1)? 'complaints' : 'cases';
            var $searchElement = angular.element(document.getElementById('case-search'));
            $searchElement.attr('placeholder', 'Search ' + searchList);
            $scope.search = $location.search().search || '';
          });

          $scope.submit = function() {
            var action = ($state.current.name.indexOf('complaint') !== -1)? 'complaints_list' : 'case_list';
            $state.go(action, {search: $scope.search}, {inherit: false});
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SetECFundCtrl',
    ['$scope', '$uibModalInstance', 'ECF_STATEMENT',
      function ($scope, $uibModalInstance, ECF_STATEMENT) {
        $scope.ecf_statements = ECF_STATEMENT;

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.save = function() {
          $scope.case.$patch().then(function () {
            $uibModalInstance.close();
          });

        };
      }
    ]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('ResetPasswordCtrl',
    ['$scope', 'user', '$uibModalInstance', 'form_utils',
      function ($scope, user_, $uibModalInstance, form_utils) {
      $scope.user_ = user_;
      $scope.$uibModalInstance = $uibModalInstance;

      $scope.save = function(frm) {

        $scope.user_.$resetPassword(this.old_password, this.new_password)
          .then(function (data) {
            $uibModalInstance.close(data);
          }, function (data) {
            form_utils.ctrlFormErrorCallback($scope, data, frm);
          });
      };

    }])
    .controller('UserListCtrl',
      ['$scope', 'users', 'User', 'form_utils', '$uibModal', 'flash',
        function($scope, users, User, form_utils, $uibModal, flash) {
          $scope.users = users;
          $scope.add_user = function(frm) {
            var user = new User(this.new_user),
              this_scope = this;
            user.$save().then(function(data){
              $scope.edit = false;
              $scope.users.push(data);
              this_scope.new_user = {};
              frm.$setPristine(true);
            },
              function (data) {
                form_utils.ctrlFormErrorCallback($scope, data, frm);
              });
          };

          $scope.reset_password = function (user) {
            $uibModal.open({
              templateUrl: 'includes/reset_password.html',
              controller: 'ResetPasswordCtrl',
              size: 'sm',
              resolve: {user: [function(){return user;}]}
            });
          };

          $scope.reset_lockout = function (user) {
            user.$resetLockout().then(function() {
              flash('Account unlocked successfully');
            });
          };
        }
      ]
    );
})();

'use strict';
(function(){

  angular.module('cla.directives')
  .directive('addressFinder', ['AddressService', '$uibModal', '$q', '$timeout', 'postal', function (AddressService, $uibModal, $q, $timeout, postal) {
    return  {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        // hijack enter on this field
        elem.bind('keydown keypress', function (event) {
          if (event.which === 13) {
            event.preventDefault();
            scope.findAddress();
          }
        });

        // find address and load modal
        scope.findAddress = function () {
          elem.attr('disabled', true);
          scope.isLoading = true;

          postal.publish({channel: 'AddressFinder', topic: 'search'});

          var modalOpts = {
            templateUrl: 'includes/address_finder.modal.html',
            controller: 'AddressFinderModalCtl',
            resolve: {
              AddressResponse: function () {
                var deferred = $q.defer();

                AddressService.query({
                  postcode: elem.val(),
                  fields: 'formatted_address'
                }, function (addresses) {
                  elem.removeAttr('disabled');
                  scope.isLoading = false;

                  deferred.resolve({
                    addresses: addresses,
                    postcode: elem.val()
                  });
                }, function () {
                  elem.removeAttr('disabled');
                  scope.isLoading = false;

                  deferred.reject();
                });

                return deferred.promise;
              }
            }
          };
          var onConfirmSuccess = function (response) {
            if (response.chosenAddress) {
              var parts = response.chosenAddress.split('\n');
              var postcode = parts.pop();
              var address = parts.join('\n');
              var streetSelector = attrs.addressFinder;

              // run inside timeout to avoid $digest clash
              $timeout(function () {
                elem
                  .val(postcode)
                  .change();
                angular.element(streetSelector)
                  .val(address)
                  .change()
                  .focus();
              });

              postal.publish({channel: 'AddressFinder', topic: 'selected'});
            } else {
              postal.publish({channel: 'AddressFinder', topic: 'cancelled'});

              $timeout(function () {
                elem.focus();
              });
            }
          };
          var onOpen = function () {
            $timeout(function () {
              angular.element('[name="address-finder-search"]').focus();
            }, 50);
          };
          var onDismiss = function () {
            postal.publish({channel: 'AddressFinder', topic: 'cancelled'});

            $timeout(function () {
              elem.focus();
            });
          };

          var modal = $uibModal.open(modalOpts);
          modal.opened.then(onOpen);
          modal.result.then(onConfirmSuccess, onDismiss);
        };
      },
      template: function(elem) {
        elem
          .after('<button type="button" class="AddressLookup-search" name="find-address" ng-click="findAddress()" ng-disabled="isLoading">Find Address</button>')
          .parents('.FormRow').addClass('AddressLookup');
      }
    };
  }]);

  angular.module('cla.services')
    .factory('AddressService', ['$resource', function($resource) {
      return $resource('/addressfinder/addresses/?postcode=:postcode&fields=:fields',
        {postcode: '@postcode', fields: '@fields'}, {
        get: {
          method: 'GET',
          isArray: true
        }
      });
    }]);

  angular.module('cla.controllers')
    .controller('AddressFinderModalCtl',
      ['$scope', 'AddressResponse', '$timeout', '$filter',
        function($scope, AddressResponse, $timeout, $filter) {
          $scope.addresses = AddressResponse.addresses;
          $scope.postcode = AddressResponse.postcode;
          $scope.suffix = $scope.addresses.length > 1 || $scope.addresses.length === 0 ? 'es' : '';
          $scope.selected = {};

          $scope.singleAddr = function (query) {
            var filtered = $filter('filter')($scope.addresses, query);

            if (filtered.length === 1) {
              $scope.selected.address = filtered[0].formatted_address;
            } else {
              $scope.selected.address = null;
            }
          };

          $scope.formatAddress = function (addr) {
            return addr.split('\n').join(', ');
          };

          $scope.close = function () {
            $scope.$dismiss('cancel');
          };

          $scope.setAddress = function(isValid) {
            if (isValid) {
              $scope.$close({
                chosenAddress: $scope.selected.address
              });
            }
          };

          $scope.singleAddr();
        }
      ]
    );
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScript', ['AppSettings', function (AppSettings) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callScript.html',
      link: function (scope, elm) {
        // remove if not enabled
        if (!AppSettings.callScriptEnabled) {
          elm.remove();
          return;
        }
      }
    };
  }]);
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callScriptToggle', ['$rootScope', 'localStorageService', 'AppSettings', 'postal', function ($rootScope, localStorageService, AppSettings, postal) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callScriptToggle.html',
      link: function (scope, elm) {
        // remove if not enabled
        if (!AppSettings.callScriptEnabled) {
          elm.remove();
          return;
        }

        if (localStorageService.get('showCallScript') === null) {
          $rootScope.showCallScript = true;
        } else {
          $rootScope.showCallScript = (localStorageService.get('showCallScript') === 'true');
        }

        scope.state = function () {
          return $rootScope.showCallScript ? 'on' : 'off';
        };

        scope.toggle = function () {
          $rootScope.showCallScript = !$rootScope.showCallScript;
          localStorageService.set('showCallScript', $rootScope.showCallScript);

          if ($rootScope.showCallScript) {
            postal.publish({channel: 'CallScript', topic: 'show'});
          } else {
            postal.publish({channel: 'CallScript', topic: 'hide'});
          }
        };
      }
    };
  }]);
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackButton', ['AppSettings', '$filter', 'flash', 'postal', function (AppSettings, filter, flash, postal) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'directives/callbackButton.html',
      scope: {
        'case': '='
      },
      link: function (scope, elm) {
        if (!AppSettings.callMeBackEnabled) {
          elm.remove();
        }

        scope.bookCallback = function (e) {
          e.stopPropagation();
          postal.publish({
            channel: 'CallBack',
            topic: 'toggle',
            data: {
              target: elm,
              _case: scope.case
            }
          });
        };
      }
    };
  }]);
})();

(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  var getDays = function (startDay) {
    var days = [
      { day: 1, text: 'Mon' },
      { day: 2, text: 'Tue' },
      { day: 3, text: 'Wed' },
      { day: 4, text: 'Thu' },
      { day: 5, text: 'Fri' },
      { day: 6, text: 'Sat' },
      { day: 7, text: 'Sun' }
    ];

    // if start day is not Monday, shift to end until new start day is at the front
    if (startDay !== 1) {
      var currentDay = 1;
      while (currentDay < startDay) {
        days.push(days.shift());
        currentDay += 1;
      }
    }

    return days;
  };

  mod.directive('callbackMatrix', ['goToCase', '_', function (goToCase, _) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'slots': '=',
        'cases': '='
      },
      templateUrl: 'directives/callbackMatrix.html',
      link: function (scope, ele, attrs) {
        // customisable options
        var startDay = parseInt(attrs.startDay) || new Date().getDay();

        scope.days = getDays(startDay);
        scope.times = [
          { hour: 9, text: '9am' },
          { hour: 10, text: '10am' },
          { hour: 11, text: '11am' },
          { hour: 12, text: '12pm' },
          { hour: 13, text: '1pm' },
          { hour: 14, text: '2pm' },
          { hour: 15, text: '3pm' },
          { hour: 16, text: '4pm' },
          { hour: 17, text: '5pm' },
          { hour: 18, text: '6pm' },
          { hour: 19, text: '7pm' }
        ];
        scope.colours = [
          { suffix: '1', text: '1-2', lowerLimit: 0 },
          { suffix: '2', text: '3-4', lowerLimit: 2 },
          { suffix: '3', text: '5-6', lowerLimit: 4 },
          { suffix: '4', text: '7-8', lowerLimit: 6 },
          { suffix: '5', text: '9+', lowerLimit: 8 }
        ];
        scope.goToCase = goToCase;

        scope.getSlot = function (day, hour) {
          return _.findWhere(scope.slots, {day: day, hour: hour});
        };

        scope.getDayTotal = function (day) {
          var slotsByDay = _.map(scope.slots, function (slot) {
            return slot.day === day ? slot.value : 0;
          });
          var sum = _.reduce(slotsByDay, function (memo, num) { return memo + num; }, 0);
          return sum;
        };

        scope.getCellClass = function (day, time) {
          if (
            day.day === 7 ||
            (day.day === 6 && time !== undefined && time.hour > 12)
          ) {
            return ' is-unavailable';
          }

          if (time !== undefined && scope.getSlot(day.day, time.hour) === undefined) {
            return ' is-empty';
          }
        };

        scope.showSlotCases = function (event, day, time) {
          var cases = _.filter(scope.cases, function ($case) {
            var callbackDate = new Date($case.requires_action_at);
            if (callbackDate.getDay() === day && callbackDate.getHours() === time) {
              return true;
            }
            return false;
          });
          ele.find('.CallbackMatrix-slot.is-active').removeClass('is-active');
          ele.find(event.target).addClass('is-active');
          scope.slotsCases = _.sortBy(cases, 'requires_action_at');
        };
      }
    };
  }]);
})();

(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackMatrixSlot', ['_', 'moment', function (_, moment) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'slot': '=callbackSlot',
        'colours': '='
      },
      templateUrl: 'directives/callbackMatrixSlot.html',
      link: function (scope, ele) {
        if (!scope.slot) {
          ele.remove();
        } else {
          scope.day = moment().day(scope.slot.day).format('dddd');
          scope.slotTimeStart = moment().hour(scope.slot.hour).format('ha');
          scope.slotTimeEnd = moment().hour(scope.slot.hour).add(1, 'h').format('ha');

          var getDensitySuffix = function (value) {
            var suffix = '1';
            angular.forEach(scope.colours, function (colour) {
              if (value > colour.lowerLimit) {
                suffix = colour.suffix;
              }
            });
            return suffix;
          };

          ele.addClass('CallbackMatrix-density CallbackMatrix-density--' + getDensitySuffix(scope.slot.value));
        }
      }
    };
  }]);
})();

/* global rome */
(function() {
  'use strict';

  var mod = angular.module('cla.directives');


  mod.directive('callbackModal', ['AppSettings', 'moment', 'postal', '$timeout', 'ClaPostalService', 'hotkeys', 'flash', 'form_utils', '$state', function (AppSettings, moment, postal, $timeout, ClaPostalService, hotkeys, flash, form_utils, $state) {
    var timeRounding = 30 * 60 * 1000; // to nearest 30 mins
    var startBuffer = 120; // in mins

    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/callbackModal.html',
      scope: {},
      controller: ["$scope", "$element", function ($scope, $element) {
        if (!AppSettings.callMeBackEnabled) {
          $element.remove();
        }

        var minStart = moment().add(startBuffer, 'minutes');
        var start = moment(Math.ceil((+minStart) / timeRounding) * timeRounding);
        $scope.setCurrentDateTime = function(dt) {
          $scope.currentDateTime = moment(dt);
        };

        $scope.setCurrentDateTime(start);

        // datepicker conf has to be set before template and other directive loads
        $scope.datePickerConf = {
          timeValidator: function (d) {
            var m = moment(d);
            var day = m.clone().day();
            var start = m.clone().hour(8).minute(59).second(59);
            var end = m.clone().hour(19).minute(30).second(1);
            var satEnd = m.clone().hour(12).minute(0).second(1);

            if (day === 0) { // sunday
              return false;
            }
            if (day === 6) { // saturday
              return m.isAfter(start) && m.isBefore(satEnd);
            }
            return m.isAfter(start) && m.isBefore(end);
          },
          dateValidator: function (d) {
            var m = moment(d);
            var today = moment();
            var day = m.clone().day();
            var start = m.clone().hour(8).minute(59).second(59);
            var end = day === 6 ? m.clone().hour(12).minute(0).second(1) : m.clone().hour(19).minute(30).second(1);

            if (day === 0) { // sunday
              return false;
            }
            if (m.isSame(today, 'day')) { // if today
              return m.isAfter(start) && m.isBefore(end);
            }
            return true;
          },
          initialValue: start,
          min: minStart
        };
      }],
      link: function (scope, elm) {
        var calendar = rome.find(angular.element('[datetime-picker]', elm)[0]);
        var target;
        scope.isVisible = false;

        var bookSub = postal.subscribe({
          channel: 'CallBack',
          topic: 'toggle',
          callback: function (data) {
            if (data._case) {
              var show = true;

              setCase(data._case);

              if (scope.isVisible) {
                show = false;
              }

              // if a targer has been passed, store it
              if (data.target) {
                target = data.target;
              }

              toggleModal(show);
            } else {
              console.warn('You must pass a case object to a callback modal');
            }
          }
        });

        scope.$on('$destroy', function handleDestroyEvent () {
          bookSub.unsubscribe();
        });

        calendar.on('data', function (value) {
          var m = moment(formatUkDateTime(value));
          var firstSlot = m.hour(9).minutes(0);
          var today = moment();

          if (!m.isSame(scope.currentDateTime, 'day')) {
            if (m.isSame(today, 'day')) {
              scope.setToday();
            } else {
              calendar.setValue(firstSlot);
            }
          }

          scope.setCurrentDateTime(calendar.getDate());

          postal.publish({ channel: 'CallBack', topic: 'set.date' });
        });

        var formatUkDateTime = function(str) {
          var date = str.split(' ')[0];
          var time = str.split(' ')[1];
          var datePieces = date.split('/');
          var timePieces = time.split(':');
          return new Date(datePieces[2], datePieces[1] - 1, datePieces[0], timePieces[0], timePieces[1]);
        };

        var toggleModal = function (toggle) {
          scope.isVisible = toggle;

          // bind/unbind click listener to show/hide results
          if (toggle) {
            angular.element('body').on('click.callbackDelegate', function (e) {
              var $target = angular.element(e.target);

              if (
                !$target.hasClass('CallbackModal') &&
                !$target.hasClass('rd-day-prev-month') &&
                !$target.hasClass('rd-day-next-month') &&
                angular.element(e.target).parents('.CallbackModal').length < 1
              ) {
                toggleModal(false);
              }
            });

            // keyboard shortcut to close modal
            hotkeys
              .bindTo(scope)
              .add({
                combo: 'esc',
                description: 'Close callback overlay',
                callback: function(e, hotkey) {
                  ClaPostalService.publishHotKey(hotkey);
                  toggleModal(false);
                }
              });

            $timeout(function() {
              elm.find('button').first().focus();
            });

            postal.publish({ channel: 'CallBack', topic: 'open' });
          } else {
            angular.element('body').off('click.callbackDelegate');
            hotkeys.del('esc');

            if (target) {
              $timeout(function() {
                target.focus();
              });
            }

            postal.publish({ channel: 'CallBack', topic: 'close' });
          }
        };

        var setCase = function (_case) {
          scope.case = _case;
          scope.canBeCalledBack = _case.canBeCalledBack();
          scope.createdByWeb = _case.createdByWeb();
          scope.isFinalCallBack = _case.isFinalCallback();

          if (scope.canBeCalledBack) {
            if (_case.isFinalCallback()) {
              scope.callbackTitle = 'Schedule final callback';
            } else if (_case.getCallbackDatetime()) {
              scope.callbackTitle = 'Schedule a new callback';
            } else {
              scope.callbackTitle = 'Schedule a callback';
            }
          } else {
            scope.callbackTitle = 'Cancel callback';
          }
        };

        scope.setToday = function () {
          var minTime = moment().add(startBuffer, 'minutes');
          var today = moment(Math.ceil((+minTime) / timeRounding) * timeRounding);
          calendar.setValue(today);
          postal.publish({ channel: 'CallBack', topic: 'set.today' });
        };

        scope.setTomorrow = function () {
          var m = moment().add(1, 'days');
          var firstSlotTomorrow;

          if (m.day() === 0) { // sunday
            m.add(1, 'days');
          }

          firstSlotTomorrow = m.hour(9).minute(0);
          calendar.setValue(firstSlotTomorrow);
          postal.publish({ channel: 'CallBack', topic: 'set.tomorrow' });
        };

        scope.bookCallback = function (form) {
          scope.case.$call_me_back({
            'datetime': (function () {
              var local = moment.tz(calendar.getDate(), 'Europe/London');
              return local.tz('UTC').format('DD/MM/YYYY HH:mm');
            })(),
            'notes': scope.callbackNotes || '',
            'priority_callback': !!scope.priorityCallback
          }).then(function() {
            flash('success', 'Callback scheduled successfully.');
            $state.go('case_list');
          }, function(data) {
            form_utils.ctrlFormErrorCallback(scope, data, form);
          });
        };

        scope.cancelCallback = function() {
          scope.case.$cancel_call_me_back().then(function() {
            flash('success', 'Callback cancelled successfully.');
            $state.go('case_list');
          });
        };

        scope.close = function() {
          toggleModal(false);
        };
      }
    };
  }]);
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackSla', ['moment', '$interval', function (moment, $interval) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var callbackDate = attrs.callbackSla;
        var caseSource = attrs.caseSource;
        var callbackTime = moment(callbackDate);
        var classes = ['is-warning', 'is-important'];
        var timer;
        var slaTimeLimits = {
          'WEB': {
            'min': 1710,
            'max': 7200
          },
          'DEFAULT': {
            'min': 7110,
            'max': 28800
          }
        };

        var slaLimits = slaTimeLimits[caseSource] || slaTimeLimits.DEFAULT;

        function getDiff () {
          var now = moment();
          return callbackTime.diff(now, 'seconds');
        }

        function setClass () {
          var className;
          var diff = getDiff();

          // over 30 mins, under 2h
          if (diff < -slaLimits.min && diff >= -slaLimits.max) {
            className = classes[0];
          }
          // over 2 hour SLA
          else if (diff < -slaLimits.max) {
            className = classes[1];
            // cancel timer as no longer needed
            $interval.cancel(timer);
          }

          // switch class, but only if it has changed
          if (!elem.hasClass(className)) {
            elem
              .removeClass(classes.join(' '))
              .addClass(className);
          }
        }

        if (callbackDate) {
          // call on first load
          setClass();

          // start timer
          timer = $interval(setClass, 1000);

          // cancel timer when scope is destroyed
          scope.$on('$destroy', function () {
            $interval.cancel(timer);
          });
        }
      }
    };
  }]);
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackStatus', ['AppSettings', '$filter', 'flash', 'postal', function (AppSettings, filter, flash, postal) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/callbackStatus.html',
      scope: {
        'case': '='
      },
      link: function (scope, elm) {
        // remove if not enabled
        if (!AppSettings.callMeBackEnabled) {
          elm.remove();
          return;
        }

        var builtInDateFilter = filter('date');

        scope.time = builtInDateFilter(scope.case.getCallbackDatetime(), 'HH:mm \'on\' d MMM yy');

        scope.completeCallback = function() {
          scope.case.$complete_call_me_back().then(function() {
            scope.case.requires_action_at = null;
            scope.case.callback_attempt = 0;

            elm.remove();
            flash('Callback stopped successfully');
            // refreshing the logs
            postal.publish({
              channel : 'models',
              topic   : 'Log.refresh'
            });
          });
        };

        scope.startCall = function() {
          scope.case.$start_call().then(function() {
            scope.case.call_started = true;
            flash('success', 'Call started successfully.');
            postal.publish({
              channel : 'models',
              topic   : 'Log.refresh'
            });
          });
        };

        if (!scope.time) {
          elm.remove();
          return;
        }
      }
    };
  }]);
})();

(function() {
  'use strict';

  var app = angular.module('cla.directives');
  app.directive('claPenceToPounds', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModel) {
        function toPounds(text) {

          if (!text) {
            return text;
          }

          var input_as_pence = text || '0';
          return (parseFloat(input_as_pence) / 100);
        }

        function toPence(text) {

          if (!text) {
            return text;
          }

          var input_as_pounds = text || '0';
          return +(parseFloat(input_as_pounds) * 100).toFixed(2);
        }

        ngModel.$parsers.push(toPence);
        ngModel.$formatters.push(toPounds);
      }
    };
  });

})();
'use strict';
(function(){
  angular.module('cla.directives')
    .directive('claServerValidate', [function() {
      return {
        restrict: 'E',
        scope: {
          for: '@for'
        },
        link: function ($scope) {
          var offWarningWatch, offErrorWatch;
          offWarningWatch = $scope.$parent.$watch('warnings.' + $scope.for, function (newVal) {
            $scope.warnings_for = newVal;
          });
          offErrorWatch = $scope.$parent.$watch('errors.' + $scope.for, function (newVal) {
            $scope.errors_for = newVal;
          });
          $scope.$on('$destroy', function () {
            offWarningWatch();
            offErrorWatch();
          });
        },
        templateUrl: 'directives/form.warning.html'
      };
    }]);
})();


'use strict';
(function(){
  angular.module('cla.directives')
    .directive('fullHeight', ['$window', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var headerHeight = angular.element('#global-header').outerHeight();
          var caseBarHeight = angular.element('.CaseBar').outerHeight();
          var headerFooterPadding = headerHeight + caseBarHeight;

          scope.initializeWindowSize = function () {
            $(element).css('min-height', $window.innerHeight - headerFooterPadding);
          };
          scope.initializeWindowSize();
          angular.element($window).bind('resize', function () {
            scope.initializeWindowSize();
          });
        }
      };
    }]);
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('copyUserAddress', ['$timeout', 'postal', function ($timeout, postal) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/copyUserAddress.html',
      scope: {
        pdEdit: '=',
        pdModel: '='
      },
      link: function (scope) {
        scope.copyAddress = function () {
          var tpForm = angular.element('[name="third_party_frm"]');
          var tpPostcode = angular.element('input[name="postcode"]', tpForm);
          var tpStreet = angular.element('textarea[name="street"]', tpForm);
          var postcode, street;

          if (scope.pdEdit) {
            var pdForm = angular.element('[name="personaldetails_frm"]');
            var pdPostcode = angular.element('input[name="postcode"]', pdForm);
            var pdStreet = angular.element('textarea[name="street"]', pdForm);

            postcode = pdPostcode.val();
            street = pdStreet.val();
          } else if (scope.pdModel) {
            postcode = scope.pdModel.postcode;
            street = scope.pdModel.street;
          }

          $timeout(function () {
            tpPostcode.val(postcode).change();
            tpStreet.val(street).change();

            postal.publish({ channel: 'AddressCopy', topic: 'click' });
          });
        };
      }
    };
  }]);
})();

(function(){
  'use strict';

  angular.module('cla.directives')
    .directive('csvUpload', ['Papa', function(Papa) {
      return {
        scope: {},
        link: function(scope, elements, attrs, ngModelCtrl) {
          elements.find('input').bind('change', function(evt){
            var elem = evt.target;
            scope.rows = [];
            scope.errors = [];
            ngModelCtrl.$setValidity('csvfile', true);

            Papa.parse(elem.files[0], {
              header: attrs.header || false,
              before: function () {
                elem.classList.add('csv-pending');
              },
              step: function (row, handle) {
                if (row.errors.length) {
                  scope.errors.push(row.errors[0]);
                  handle.abort();
                } else {
                  scope.rows.push(row.data[0]);
                }
              },
              complete: function () {
                if (!scope.errors.length) {
                  ngModelCtrl.$setViewValue(scope.rows);
                  elem.classList.remove('csv-pending');
                  elem.classList.add('csv-complete');
                  scope.rows = [];
                  scope.errors = [];
                  scope.global_error = null;
                } else {
                  ngModelCtrl.$setValidity('csvfile', false);
                }
                scope.$apply();
              },
              error: function(err, file, inputElem, reason) {
                scope.global_error = {err: err, reason: reason};
                scope.$apply();
                elem.classList.remove('csv-pending');
                elem.classList.add('csv-error');
              }
            });
          });
        },
        templateUrl: 'directives/csvUpload.html',
        restrict: 'E',
        require: '?ngModel'
      };
    }]);
})();

/* global rome */
(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('datePicker', function() {
      return {
        restrict: 'A',
        scope: {
          config: '=pickerConfig'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
          var settings = $.extend({
            time: false,
            weekStart: 1,
            dayFormat: 'D',
            monthFormat: 'MMMM YY',
            inputFormat: 'DD/MM/YYYY'
          }, scope.config);

          rome(element[0], settings).on('data', function (value) {
            if (ngModelCtrl) {
              ngModelCtrl.$setViewValue(value);
            }
          });
        }
      };
    });

  angular.module('cla.directives')
    .directive('datetimePicker', function() {
      return {
        restrict: 'A',
        scope: {
          config: '=pickerConfig'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
          var settings = $.extend({
            weekStart: 1,
            inputFormat: 'DD/MM/YYYY HH:mm',
            timeInterval: 1800
          }, scope.config);

          rome(element[0], settings).on('data', function (value) {
            if (ngModelCtrl) {
              ngModelCtrl.$setViewValue(value);
            }
          });
        }
      };
    });
}());

(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('details', function() {
      return {
        restrict: 'E',
        link: function(scope, element) {
          var hasNativeSupport = 'open' in document.createElement('details'),
              notSummaryChildren,
              toggleShow;

          // return if browser already has native support
          if (hasNativeSupport) { return; }

          notSummaryChildren = element.children(':not(summary)');
          // hide on load
          notSummaryChildren.hide();

          toggleShow = function () {
            notSummaryChildren
              .toggle()
              .toggleClass('is-open');
            element
              .toggleClass('is-open');
          };

          element
            .addClass('is-notnative')
            .on('click', toggleShow);
        }
      };
    });
}());

(function () {
  'use strict';

  angular.module('xeditable').directive('editableFilterselect', [
    'editableDirectiveFactory',
    'editableNgOptionsParser',
    function (editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableFilterselect',
        inputTpl: '<select ui-select2="{allowClear: true}"><option value=""></option></select>',
        useCopy: true
      });
    }
  ]);
})();

(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('feedbackButton', ['$state', '$compile', '$http', '$timeout', 'AppSettings', 'flash', 'url_utils', 'hotkeys',
      function($state, $compile, $http, $timeout, AppSettings, flash, url_utils, hotkeys) {
      return {
        restrict: 'C',
        replace: true,
        scope: true,
        link: function(scope, elem) {
          scope.isPopoverVisible = false;
          scope.feedbackTypes = ['Issue', 'Suggestion'];

          function reset() {
            scope.feedbackType = scope.feedbackTypes[0];
            scope.comments = '';
          }

          // Create and compile overlay and insert next to the feedback button
          var popover = angular.element('<feedback-popover/>');
          popover.insertAfter(elem);
          $compile(popover)(scope);

          reset();

          scope.toggle = function() {
            scope.isPopoverVisible = !scope.isPopoverVisible;
            elem.toggleClass('feedbackButton--toggled', scope.isPopoverVisible);

            if(scope.isPopoverVisible) {
              $timeout(function() {
                popover.find('textarea').first().focus();
              });
            }
          };

          scope.close = function() {
            scope.toggle(false);
            reset();
            scope.feedback_frm.$setValidity('server', true);
          };

          scope.submit = function(form) {
            $http({
              url: url_utils.url('zendesk/'),
              method: 'POST',
              data: $.param({
                comments: this.comments,
                feedback_type: this.feedbackType,
                url: $state.href($state.current),
                app_name: AppSettings.appName,
                user_agent: navigator.userAgent
              }),
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
              }
            }).success(function(){
              scope.close();
              flash('success', 'Your feedback has been sent');
            }).error(function() {
              form.$setValidity('server', false);
            });
          };

          // Set up hotkeys
          hotkeys.bindTo(scope)
            .add({
              combo: '!',
              description: 'Toggle feedback overlay',
              callback: function() {
                scope.toggle(!scope.isPopoverVisible);
              }
            })
            // Close dialogue on ESC but don't clear the form
            .add({
              combo: 'esc',
              allowIn: ['SELECT', 'TEXTAREA'],
              callback: function() {
                scope.toggle(false);
              }
            });
        }
      };
    }
  ]);
}());

'use strict';
(function(){
  angular.module('cla.directives')

    .directive('feedbackPopover', function() {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/feedbackPopover.html'
      };
    });
})();

'use strict';
(function(){

  angular.module('cla.directives')

  // use $interval instead of $timeout as interval doesn't block the tests
  .factory('flash', ['$rootScope', '$interval', function ($rootScope, $interval) {
    var messages = [];
    var default_message = 'An error has occured';
    var reset;

    var cleanup = function() {
      $interval.cancel(reset);
      reset = $interval(function() {
        messages = [];
      });
    };

    var emit = function() {
      $rootScope.$emit('flash:message', messages, cleanup);
    };

    $rootScope.$on('$routeChangeSuccess', emit);

    var asMessage = function(level, text) {
      if (text === undefined) {
        text = level;
        level = 'success';
      }
      return {
        level: level,
        text: text || default_message
      };
    };

    var asArrayOfMessages = function(level, text) {
      if (level instanceof Array) {
        return level.map(function(message) {
          return message.text ? message : asMessage(message);
        });
      }

      return text !== undefined ? [{ level: level, text: text || default_message }] : [asMessage(level)];
    };

    return function(level, text) {
      emit(messages = asArrayOfMessages(level, text));
    };
  }])

  .directive('flashMessages', ['$rootScope', '$interval', '$filter', 'postal', function ($rootScope, $interval, $filter, postal) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/flashMessages.html',
      link: function(scope) {
        scope.messages = [];

        scope.levelClassName = function(level) {
          return level;
        };

        scope.hide = function(_msg) {
          // hides the msg after cancelling the timeout if defined
          $interval.cancel(_msg.timeout);
          scope.messages = _.reject(scope.messages, function(el) { return el === _msg;});
        };

        $rootScope.$on('flash:message', function(event, messages) {
          angular.forEach(messages, function(message) {
            // adding timeout to make msg disappear
            (function(_msg) {
              var f = function() {
                scope.hide(_msg);
              };

              _msg.timeout = $interval(f, 4500);
            })(message);

            // add msg to list
            scope.messages = scope.messages.concat([message]);
            // track message in analytics if not a success message
            if (message.level !== 'success') {
              postal.publish({
                channel: 'FlashMessage',
                topic: message.level,
                data: {
                  label: $filter('stripTags')(message.text)
                }
              });
            }
          });

          if(!scope.$$phase) {
            scope.$apply();
          }
        });
      }
    };
  }]);

})();

(function(){
  'use strict';

  // labels a form as changed if change event was called
  // similar to $dirty, but that doesn't change at the right time for eligibility check
  angular.module('cla.directives')
    .directive('formChanged', function() {
      return {
        restrict: 'A',
        link: function(scope, element) {
          element.on('change', function() {
            scope.formDidChange = true;
         });
       }
      };
    });

})();

'use strict';
(function(){


  angular.module('cla.directives')
  .directive('serverError', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ctrl) {
        element.on('change blur', function() {
          scope.$apply(function() {
            ctrl.$setValidity('server', true);
            ctrl.$validate();
          });
        });
      }
    };
  });

})();

'use strict';
(function(){

  angular.module('cla.directives')
  .directive('moneyInterval', function() {
    return  {
      restrict: 'E',
      require: 'ngModel',
      templateUrl:  'directives/money_interval.html',
      scope: {
        model: '=ngModel',
        name: '@ngModel',
        miLabel: '@',
        guidanceLink: '=?'
      },
      link: function(scope, elem, attrs, ngModelCtrl) {
        function toMoneyInterval(viewValue){
          if (viewValue) {
            scope.per_interval_value = viewValue.per_interval_value;
            scope.interval_period = viewValue.interval_period;
          } else {
            scope.per_interval_value = undefined;
            scope.interval_period = undefined;
          }
          return viewValue;
        }

        scope.$watch('per_interval_value + interval_period', function () {
          if (scope.per_interval_value !== undefined && !scope.interval_period) {
            scope.interval_period = 'per_month';
          }

          if (scope.per_interval_value !== undefined) {
            scope.per_interval_value = parseInt(scope.per_interval_value);
          }


          ngModelCtrl.$setViewValue(
            {
              per_interval_value: scope.per_interval_value,
              interval_period: scope.interval_period
            });

        });

        ngModelCtrl.$render = function() {
          if (ngModelCtrl.$viewValue) {
            scope.per_interval_value = ngModelCtrl.$viewValue.per_interval_value;
            scope.interval_period  = ngModelCtrl.$viewValue.interval_period;
          } else {
            scope.per_interval_value = undefined;
            scope.interval_period = undefined;
          }
        };

        ngModelCtrl.$formatters.push(toMoneyInterval);
      }
    };
  });

})();

(function() {
  'use strict';

  angular.module('cla.directives').directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  });
})();

(function(){
  'use strict';

  var NI_REGEXP = /^\s*([a-zA-Z]){2}(\s*[0-9]\s*){6}([a-zA-Z]){1}?$/;

  angular.module('cla.directives')
    .directive('niNumber', function() {
      return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
          ctrl.$parsers.unshift(function(viewValue) {
            if (viewValue === '' || NI_REGEXP.test(viewValue.replace(/ /g,''))) {
              ctrl.$setValidity('nino', true);
              return viewValue;
            } else {
              ctrl.$setValidity('nino', false);
              return undefined;
            }
          });
        }
      };
    });
})();

(function(){
  'use strict';

  var saveDelay = 800;

  angular.module('cla.directives')
    .directive('notesForm', ['$timeout', 'form_utils', 'AppSettings', function($timeout, form_utils, AppSettings) {
      return  {
        restrict: 'E',
        require: 'ngModel',
        templateUrl:  'directives/notes_form.html',
        scope: {
          model: '=ngModel',
          ref: '@ngModel',
          case: '='
        },
        link: function(scope) {
          var timeout = null,
              saveInProgress = false,
              saveFinished = function() {
                saveInProgress = false;
              },
              watchChange = function(newVal, oldVal) {
                if (newVal !== oldVal) {
                  if (timeout) {
                    $timeout.cancel(timeout);
                  }
                  timeout = $timeout(scope.save, saveDelay);
                }
              };

          scope.save = function(){
            $timeout.cancel(timeout);

            if (scope.notesFrm.$valid && !saveInProgress) {
              saveInProgress = true;
              scope.case.$case_details_patch(
                angular.noop,
                function(response){
                  form_utils.ctrlFormErrorCallback(scope, response, scope.notesFrm);
                }
              ).finally(saveFinished);
            }
          };

          scope.type = AppSettings.appName === 'operator' ? 'operator' : 'cla_provider';

          // watch fields
          scope.$watch('model', watchChange);
        }
      };
    }]);

})();

(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('notesHistory', ['$uibModal', 'postal', function($uibModal, postal) {
      return {
        restrict: 'A',
        scope: {
          type: '@historyType'
        },
        link: function (scope, elem, attrs) {
          elem.on('click', function() {
            postal.publish({
              channel: 'NotesHistory',
              topic: 'view',
              data: {
                label: scope.type
              }
            });

            scope.caseRef = attrs.notesHistory;
            scope.summary = attrs.summary || true;

            var onModalClose = function () {
              elem.focus();
            };

            $uibModal.open({
              templateUrl: 'notes.history.modal.html',
              scope: scope,
              controller: 'NotesHistoryModalCtl'
            }).result.then(onModalClose, onModalClose);
          });
        }
      };
    }]);

  angular.module('cla.controllers')
    .controller('NotesHistoryModalCtl',
      ['$scope', '$uibModalInstance', 'NotesHistory', 'dmp', '$escapeHtml',
        function($scope, $uibModalInstance, NotesHistory, dmp, $escapeHtml) {

          function getPages () {
            NotesHistory.query(
              {
                case_reference: $scope.caseRef,
                type: $scope.type,
                page: $scope.currentPage,
                with_extra: true,
                summary: $scope.summary
              }
            ).$promise.then(function(data) {
                var el,
                  prevNotes = {};

                $scope.notes = data;

                for (var i=$scope.notes.results.length-1; i>=0; i-=1) {
                  el = $scope.notes.results[i];
                  el.diffHTML = dmp.createSemanticDiffHtml(
                    $escapeHtml(prevNotes.type_notes) || ' ', $escapeHtml(el.type_notes) || ' '
                  );
                  prevNotes = el;
                }

                if (data.next !== null) {
                  $scope.notes.results.pop();
                }
              });
          }

          $scope.updatePage = function(page) {
            $scope.currentPage = page;
            getPages();
          };

          $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
          };

          $scope.toggleSummary = function() {
            $scope.summary = !$scope.summary;
            $scope.currentPage = 1;
            getPages();
          };

          $scope.currentPage = 1;

          getPages();
        }
      ]
    );
}());

(function(){
  'use strict';

  angular.module('cla.directives')
    .directive('notifications', [function() {
      return {
        templateUrl: 'directives/notifications.html',
        controller: 'NotificationCtrl',
        replace: true
      };
    }]
  );
})();

(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('outcomeFeedback', ['FEEDBACK_ISSUE', function (FEEDBACK_ISSUE) {
    return {
      restrict: 'E',
      templateUrl: 'directives/outcomeFeedback.html',
      scope: {
        'issue': '=',
        'outcomeCode': '=',
        'form': '=',
        'submitted': '='
      },
      link: function (scope) {
        scope.issues = FEEDBACK_ISSUE; // possible reasons
        scope.showFeedback = false; // default show value

        scope.shouldLeaveFeedback = function () {
          return scope.showFeedback || (scope.outcomeCode === 'MIS');
        };
      }
    };
  }]);
})();

(function(){
  'use strict';
  /**
   * A generic confirmation for risky actions.
   * Usage: Add attributes: ng-really-message="Are you sure"? ng-really-click="takeAction()" function
   */
  angular.module('cla.directives').directive('ngReallyClick', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            var message = attrs.ngReallyMessage;
            if (message && confirm(message)) {
              scope.$apply(attrs.ngReallyClick);
            }
          });
        }
      };
    }
  ]);
})();
'use strict';
(function(){
  angular.module('cla.directives')
    .directive('safeToContact', ['CONTACT_SAFETY', 'postal', function(CONTACT_SAFETY, postal) {
      return {
        restrict: 'E',
        scope: {
          person: '='
        },
        templateUrl: 'directives/safe_to_contact.html',
        link: function(scope) {

          var lookup = {
            'Safe to contact': CONTACT_SAFETY.SAFE,
            'Not safe to call': CONTACT_SAFETY.DONT_CALL,
            'Not safe to leave a message': CONTACT_SAFETY.NO_MESSAGE
          };

          scope.setSafe = function(name) {
            scope.person.safe_to_contact = lookup[name];
            scope.showOpts = false;

            postal.publish({
              channel: 'SafeToContact',
              topic: 'change',
              data: {
                label: name
              }
            });
          };

          scope.iconClass = function () {
            switch(scope.person.safe_to_contact) {
              case CONTACT_SAFETY.SAFE:
                return 'Icon--call Icon--green';
              case CONTACT_SAFETY.DONT_CALL:
                return 'Icon--dontcall Icon--red';
              case CONTACT_SAFETY.NO_MESSAGE:
                return 'Icon--novoicemail Icon--red';
              default:
                return 'Icon--call';
            }
          };

          scope.options = [
            {'name': 'Safe to contact', 'value': CONTACT_SAFETY.SAFE},
            {'name': 'Not safe to call', 'value': CONTACT_SAFETY.DONT_CALL},
            {'name': 'Not safe to leave a message', 'value': CONTACT_SAFETY.NO_MESSAGE}
          ];
        }
      };
    }]);
})();

(function(){
  'use strict';

  // event trigger for search filters
  angular.module('cla.directives')
    .directive('searchFilter', ['postal', function (postal) {
      return {
        restrict: 'A',
        link: function(scope, elem) {
          elem
            .on('blur', function () {
              if (elem.val() !== '') {
                var lbl = elem.attr('name');
                postal.publish({channel: 'SearchFilter', topic: 'search', data: {label: lbl}});
              }
            })
            .on('keydown keypress', function (event) {
              if (event.which === 13) {
                event.preventDefault();
              }
            });
        }
      };
    }]);
})();

'use strict';
(function(){

  angular.module('cla.directives')
    .directive('systemMessage', ['$rootScope', function ($rootScope) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directives/systemMessage.html',
        link: function(scope) {
          $rootScope.$on('system:message', function(event, msg, closeable) {
            scope.message = msg;
            scope.isCloseable = closeable || false;
          });

          scope.clearMessage = function () {
            if (scope.isCloseable) {
              scope.message = null;
            }
          };
        }
      };
    }]);

})();

'use strict';
(function(){



  angular.module('cla.directives')
  .directive('threePartDateInput', function() {
    return  {
      restrict: 'E',
      require: 'ngModel',
      templateUrl:  'directives/three_part_date_input.html',
      scope: {
        model: '=ngModel'
      },
      link: function(scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$setViewValue(scope.model);
      }
    };
  });


  angular.module('xeditable').directive('editableTpde', ['editableDirectiveFactory',
    function(editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableTpde',
        inputTpl: '<three-part-date-input></three-part-date-input>',
        useCopy: true
      });
    }]);

})();

'use strict';
(function(){

  angular.module('cla.directives')
  .directive('timer', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/timer.html',
      scope: {
        baseTime: '=?',
        startButton: '=?'
      },
      controller: ['$scope', '$rootScope', 'TimerFactory', 'Timer', 'Stopwatch', '$window',
        function($scope, $rootScope, TimerFactory, Timer, Stopwatch, $window) {
        $scope.isEnabled = Timer.isEnabled();

        $scope.timer = new Stopwatch({
          baseTime: ($scope.baseTime || 0)
        });

        // EVENTS (listeners)

        $rootScope.$on('timer:changed', function(__, time) {
          if ($scope.timer.running) {
            // running so just updating the currentTime to keep it in sync
            $scope.timer.setCurrentTime(time);
          } else {
            // not running so starting with currentTime from db
            $scope.timer.start(time);
          }
        });

        $rootScope.$on('timer:stopped', function() {
          $scope.timer.stop();
        });

        $scope.$on('$destroy', function() {
          $scope.timer.stop();
        });

        var startTimer = function() {
          $rootScope.$emit('timer:start');
        };

        var stopTimer = function() {
          $rootScope.$emit('timer:stop');
        };

        $scope.toggleTimer = function() {
          if ($scope.startButton) {
            if ($scope.timer.running && $window.confirm('Are you sure you want to cancel the running timer? (Time will not be billable)')) {
              stopTimer();
            } else {
              startTimer();
            }
          }
        };

      }]
    };


  }).factory('TimerFactory', ['$http', 'url_utils', function($http, url_utils) {
    // API
    var TimerFactory = {
      baseUrl: url_utils.proxy('timer/'),
      defaults: {
        ignoreExceptions: [404]
      },

      getOrCreate: function(successCallback, errorCallback, ignoreExceptions) {
        return $http.post(this.baseUrl, {}, {
            'ignoreExceptions': ignoreExceptions || this.defaults.ignoreExceptions
          }).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      },

      get: function(successCallback, errorCallback, ignoreExceptions) {
        return $http.get(this.baseUrl, {
            'ignoreExceptions': ignoreExceptions || this.defaults.ignoreExceptions
          }).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      },

      stop: function(successCallback, errorCallback, ignoreExceptions) {
        return $http.delete(this.baseUrl, {
          'ignoreExceptions': ignoreExceptions || this.defaults.ignoreExceptions
        }).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      }
    };
    return TimerFactory;

  }]).factory('Stopwatch', ['$interval', function($interval) {
    var Stopwatch = function (options) {
      _.bindAll(this, '_setTime', 'formatTime');
      this.settings = angular.extend({}, this.defaults, options);

      this.currentTime = this.settings.startTime;
      this.baseTime = this.settings.baseTime;
      this.running = false;
      this._updateValue();
    };

    Stopwatch.prototype = {
      defaults: {
        baseTime: 0,
        startTime: 0,
        separator: ':'
      },

      start: function (startFrom) {
        if (startFrom !== undefined) {
          this.currentTime = startFrom;
        }
        this.timer = $interval(this._setTime, 1000);
        this.running = true;
      },

      stop: function () {
        $interval.cancel(this.timer);

        this.running = false;

        this.currentTime = 0;
        this._updateValue();
      },

      setCurrentTime: function(currentTime) {
        this.currentTime = currentTime;
      },

      _setTime: function () {
        this.currentTime += 1;
        this._updateValue();
      },

      _updateValue: function () {
        this.value = this.formatTime(this.baseTime + this.currentTime);
      },

      formatTime: function (time) {
        var secs = this.pad(time % 60),
            mins = this.pad(parseInt(time / 60) % 60),
            hrs = this.pad(parseInt(time / 3600) % 24);

        return hrs + this.settings.separator + mins + this.settings.separator + secs;
      },

      pad: function (val) {
        return val > 9 ? val : '0' + val;
      }
    };

    return Stopwatch;

  }])
  .provider('Timer', [function() {
    /*
      This deals with 2 types of events:

      ACTION EVENTS:
        Emit this if you want a backend check/action. You should never listen to this events
        from anywhere else apart from here.

        * 'timer:start': gets or creates a timer from the backend
        * 'timer:check': checks if a timer is running asking the backend
        * 'timer:stop': stops a running timer on the backend

      APPLICATION EVENTS:
        Emitted by this module every time the state of the timer changes. You should never emit
        these events but only listen to them.

        * 'timer:changed': with 'time' as param. Used to notify listeners that the timer has
          changed
        * 'timer:stopped': used to notify listeners that the timer has stopped. Please note that
          this doesn't check if the timer is running so it might be emitted even when the timer
          is not running.
    */

    this.$get = ['$rootScope', 'TimerFactory', 'flash', '$window', 'AppSettings', function($rootScope, TimerFactory, flash, $window, AppSettings) {
        return {
            isEnabled: function() {
              return AppSettings.timerEnabled();
            },
            install: function() {
              if (!AppSettings.timerEnabled()) {
                // we need to mock some events listeners
                $rootScope.$on('timer:start', function(__, options) {
                  options = options || {};
                  (options.success || angular.noop)();
                });

              } else {

                var LOCAL_STORAGE_KEY = 'cla:timer',
                    onTimerChangedAPICallback = function(dateCreated) {
                      var time = Math.ceil((new Date().getTime() - new Date(dateCreated).getTime()) / 1000);
                      localStorage.setItem(LOCAL_STORAGE_KEY, time);
                      emitTimerChanged(time);
                    },
                    onTimerStoppedAPICallback = function() {
                      localStorage.setItem(LOCAL_STORAGE_KEY, null);
                      emitTimerStopped();
                    },
                    emitTimerChanged = function(time) {
                      $rootScope.$emit('timer:changed', time);
                      $rootScope.timerRunning = true;
                    },
                    emitTimerStopped = function() {
                      $rootScope.$emit('timer:stopped');
                      $rootScope.timerRunning = false;
                    };

                // ACTION EVENTS
                // emitting timer:check, timer:stop and timer:start triggers this module
                // to call the backend and check if the timer is running or not

                $rootScope.$on('timer:check', function() {
                  TimerFactory.get(function(data) {
                    onTimerChangedAPICallback(data.created);
                  }, function() {
                    onTimerStoppedAPICallback();
                  });
                });

                $rootScope.$on('timer:start', function(__, options) {
                  options = options || {};

                  TimerFactory.getOrCreate(function(data) {
                    onTimerChangedAPICallback(data.created);
                    (options.success || angular.noop)();
                  }, function(data, status) {
                    if (status === 400) {
                      flash('error', data.detail || '');
                    }
                    (options.error || angular.noop)();
                  });
                });

                $rootScope.$on('timer:stop', function(__, options) {
                  options = options || {};

                  TimerFactory.stop(function() {
                    onTimerStoppedAPICallback();
                    (options.success || angular.noop)();
                  }, function(data, status) {
                    if (status === 400) {
                      flash('error', data.detail || '');
                    }
                    (options.error || angular.noop)();
                  });
                });

                // listener which starts/stops timer if the timer has been stopped
                // or started in another window/tab

                $window.addEventListener('storage', function(event) {
                  if (event.key === LOCAL_STORAGE_KEY) {
                    var time = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY));
                    if (isNaN(time)) {
                      emitTimerStopped();
                    } else {
                      emitTimerChanged(time);
                    }
                  }
                });
              }
            }
        };
    }];
  }]);

})();

(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('timestamp', ['$filter', function (filter) {
      return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl:  'directives/timestamp.html',
        scope: {
          date: '=ngModel'
        },
        link: function(scope) {
          var builtInDateFilter = filter('date');
          scope.formattedDate = builtInDateFilter(scope.date, 'EEEE, dd MMMM yyyy \'at\' HH:mm');
        }
      };
    }]);
}());

(function () {
  'use strict';

  angular.module('cla.services')
    .run(['postal', '$analytics', function(postal, $analytics) {
      var $body = angular.element('body');
      var trackEvent = function (data, envelope) {
        var eventData = {
          category: envelope.channel
        };

        if (data) {
          if (data.value !== undefined) {
            eventData.value = data.value;
          }
          if (data.label !== undefined) {
            eventData.label = data.label;
          }
        }

        $analytics.eventTrack(envelope.topic, eventData);
      };

      // Address Finder
      var addressFinder = postal.channel('AddressFinder');
      addressFinder.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Notes History
      var notesHistory = postal.channel('NotesHistory');
      notesHistory.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Eligibility Check
      var EligibilityCheck = postal.channel('EligibilityCheck');
      EligibilityCheck.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Guidance
      var Guidance = postal.channel('Guidance');
      Guidance.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Call Scripts
      var CallScript = postal.channel('CallScript');
      CallScript.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Assign Provider
      var AssignProvider = postal.channel('AssignProvider');
      AssignProvider.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Callback modal
      var CallBack = postal.channel('CallBack');
      CallBack.subscribe({
        topic: 'open',
        callback: trackEvent
      });
      CallBack.subscribe({
        topic: 'close',
        callback: trackEvent
      });
      CallBack.subscribe({
        topic: 'set.*',
        callback: trackEvent
      });

      // Search filters
      var SearchFilter = postal.channel('SearchFilter');
      SearchFilter.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Income Warnings
      var IncomeWarnings = postal.channel('IncomeWarnings');
      IncomeWarnings.subscribe({
        topic: 'update',
        callback: function (data) {
          angular.forEach(data.warnings, function (value, key) {
            $analytics.eventTrack(key, {category: 'IncomeWarnings'});
          });
        }
      });

      // Person card
      var Person = postal.channel('Person');
      Person.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Third party card
      var ThirdParty = postal.channel('ThirdParty');
      ThirdParty.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Safe to contact flag
      var SafeToContact = postal.channel('SafeToContact');
      SafeToContact.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // User address copy
      var AddressCopy = postal.channel('AddressCopy');
      AddressCopy.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Hotkey use
      var HotKey = postal.channel('HotKey');
      HotKey.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Server side error catching
      var ServerError = postal.channel('ServerError');
      ServerError.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Error/warning modal tracking
      var ConfirmationModal = postal.channel('ConfirmationModal');
      ConfirmationModal.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Error/warning flash message tracking
      var FlashMessage = postal.channel('FlashMessage');
      FlashMessage.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // EOD
      var EOD = postal.channel('EOD');
      EOD.subscribe({
        topic: '*',
        callback: trackEvent
      });

      $body
        // Details/Summary clicks
        .on('click', 'summary', function () {
          var $details = angular.element(this).parent('details');
          var summaryText = angular.element(this).text();

          if (
            (!$details.hasClass('is-notnative') && !$details.is('[open]')) ||
            ($details.hasClass('is-notnative') && $details.hasClass('is-open'))
          ) {
            $analytics.eventTrack('click', {  category: 'DetailsTag', label: summaryText });
          }
        })
        // External link clicks
        .on('click', '[target="_blank"]', function () {
          var $this = angular.element(this);
          var text = $this.text();
          var loc = $this.attr('href');

          $analytics.eventTrack(loc, {  category: 'Outbound', label: text });
        })
        // Diagnosis history
        .on('click', '.CaseHistory-card a', function () {
          var $this = angular.element(this);
          var text = $this.text();

          $analytics.eventTrack('click', {  category: 'CaseHistory', label: text });
        });
    }]);
})();

(function () {
  'use strict';

  // in seconds
  var idle = 3300;
  var timeout = 300;

  angular.module('cla.operatorApp')
    .config(['IdleProvider', function(IdleProvider) {
      IdleProvider.autoResume(false); // don't auto resume
      IdleProvider.idle(idle);
      IdleProvider.timeout(timeout);
    }]);

  angular.module('cla.services')
    .run(['$rootScope', 'postal', 'Idle', '$uibModal', '$http', 'form_utils', 'url_utils', 'flash',
      function($rootScope, postal, Idle, $uibModal, $http, form_utils, url_utils, flash) {
        var loginModal, warningModal;

        var openLoginModal = function () {
          closeModals();

          loginModal = $uibModal.open({
            templateUrl: 'includes/login.html',
            backdrop: 'static',
            controller: ["$scope", function ($scope) {
              $scope.login = function (form) {
                $http({
                  url: url_utils.login,
                  method: 'POST',
                  data: $.param({
                    username: this.username,
                    password: this.password
                  }),
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                  }
                }).then(
                  function() {
                    flash('Your session has been successfully restored');
                    $scope.$close();
                    loginModal = null;
                  },
                  function(response){
                    form_utils.ctrlFormErrorCallback($scope, response, form);
                  }
                );
              };
            }]
          });
        };

        var openWarningModal = function () {
          warningModal = $uibModal.open({
            templateUrl: 'includes/session_expiring.html',
            backdrop: 'static',
            controller: ["$scope", function ($scope) {
              $scope.countdown = timeout;

              $scope.extend = function () {
                $http({
                  url: url_utils.proxy('user/me/'),
                  method: 'GET'
                })
                .then(
                  function () {
                    $scope.$close();
                    warningModal = null;
                  },
                  function () {
                    logout();
                  }
                );
              };

              $scope.logout = function () {
                logout();
              };
            }]
          });
        };

        var closeModals = function () {
          if (warningModal) {
            try {
              warningModal.close();
            } catch (err) {
            } finally {
              warningModal = null;
            }
          }
          if (loginModal) {
            try {
              loginModal.close();
            } catch (err) {
            } finally {
              loginModal = null;
            }
          }
        };

        var logout = function () {
          $http({
            url: 'auth/logout/',
            method: 'GET'
          })
          .then(openLoginModal);
        };

        // Listen to authentication events
        var AuthSub = postal.channel('Authentication');
        AuthSub.subscribe({
          topic: 'unauthorized',
          callback: openLoginModal
        });
        AuthSub.subscribe({
          topic: 'extend',
          callback: function (data) {
            Idle.setIdle(data.expiresIn - timeout);
          }
        });

        // Open modal when idle time has passed without action
        $rootScope.$on('IdleStart', openWarningModal);
        // close modal if idle time is interrupted
        $rootScope.$on('IdleEnd', closeModals);
        // open modal if idle time ends without interruption
        $rootScope.$on('IdleTimeout', logout);

        // start watching for idleness
        Idle.watch();
      }
    ]);
})();

'use strict';
(function(){
  angular.module('cla.services')
    .factory('cla.guidance', ['GuidanceNote', function(GuidanceNote) {
      return {
        search: function(query) {
          return GuidanceNote.query({'search': query}).$promise;
        },

        getDoc: function(docName) {
          return GuidanceNote.get({'name': docName}).$promise;
        }
      };
    }
  ]);

  angular.module('cla.controllers')
    .controller('GuidanceCtrl',
      ['$scope', '$rootScope', '$http', 'cla.guidance', '$sce', '$location', 'postal',
        function($scope, $rootScope, $http, guidance, $sce, $location, postal){
          $scope.results = [];
          $scope.htmlDoc = null;

          $scope.search = function() {
            if ($scope.guidance !== undefined) {
              postal.publish({channel: 'Guidance', topic: 'search'});

              guidance.search($scope.guidance.query).then(function(data) {
                $scope.results = data;
                $scope.no_results = data.length === 0 && $scope.guidance.query !== '' ? true : false;
              });
            } else {
              postal.publish({channel: 'Guidance', topic: 'search.blank'});
            }
          };

          $scope.addDoc = function(docName) {
            $scope.toggleResults(false);
            $scope.docName = docName;
          };

          $scope.closeDoc = function() {
            $scope.htmlDoc = null;
          };

          $scope.toggleResults = function(toggle) {
            $scope.show_results = toggle;

            // bind/unbind click listener to show/hide results
            if (toggle) {
              angular.element('body').on('click.guidanceDelegate', function (e) {
                if (angular.element(e.target).parents('.Guidance-searchContainer').length < 1) {
                  $scope.toggleResults(false);
                }
              });
            } else {
              angular.element('body').off('click.guidanceDelegate');
            }
          };

          $scope.$watch('docName', function(newVal) {
            if (!newVal) {
              $scope.htmlDoc = null;
            } else {
              var docName = newVal;

              guidance.getDoc(docName).then(function(doc) {
                // track the document that has been opened
                postal.publish({
                  channel: 'Guidance',
                  topic: 'openDoc',
                  data: {
                    label: '/static/guidance/' + doc.name + '.html'
                  }
                });

                $scope.htmlDoc = $sce.trustAsHtml(doc.body);
              });
            }
          });

          $rootScope.$on('guidance:openDoc', function(__, docName) {
            $scope.addDoc(docName);
          });

          $rootScope.$on('guidance:closeDoc', function() {
            postal.publish({channel: 'Guidance', topic: 'closeDoc'});
            $scope.htmlDoc = null;
            $scope.docName = null;
          });
        }
      ]
    );

  angular.module('cla.operatorApp')
    .run(function() {
      $(document.body).append('<div ng-controller="GuidanceCtrl"><guidance></guidance></div>');
    });

  angular.module('cla.providerApp')
    .run(function() {
      $(document.body).append('<div ng-controller="GuidanceCtrl"><guidance></guidance></div>');
    });


  angular.module('cla.directives')
    .directive('guidance', [function() {
      return {
        restrict: 'E',
        templateUrl: 'directives/guidance.html'
      };
    }]
  );

  angular.module('cla.directives')
    .directive('guidanceLink', [function() {
      return {
        restrict: 'E',
        scope: {
          doc: '@doc'
        },
        templateUrl: 'directives/guidance.inline_link.html',
        link: function(scope) {
          scope.openGuidance = function() {
            scope.$emit('guidance:openDoc', scope.doc);
          };
        }
      };
    }]
  );

  angular.module('cla.directives')
    .directive('guidanceItem', [function() {
      return {
        restrict: 'E',
        scope: {
          content: '=',
          ref: '='
        },
        templateUrl: 'directives/guidance.tab.html',
        link: function(scope) {
          scope.closeDoc = function() {
            scope.$emit('guidance:closeDoc', scope.ref);
          };

          scope.$watch('content', function(newVal) {
            if (newVal) {
              scope.minimise = false;
            }
          });
        }
      };
    }]
  );
})();


(function () {
  'use strict';

  angular.module('cla.operatorApp')
  .run(['AppSettings', '$rootScope', '$window', '$interval', function(AppSettings, $rootScope, $window, $interval) {
    if (AppSettings.tabWarningEnabled) {
      var LOCAL_STORAGE_KEY = 'cla:tabs-open',
          Tab = function () {
            _.bindAll(this, 'keepAlive');

            this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==='x'?r:r&0x3|0x8;return v.toString(16);});

            // on init and every 30 secs, reset the states of the tabs and
            // the open tabs will add themselves to the list. See $window.addEventListener('storage')
            this.keepAlive();
            this._interval = $interval(this.keepAlive, 30000);
            return this;
          },
          tab = null;

      Tab.prototype = {
        _getJSONItem: function() {
          /*
          Returns the JSON object stored in the localStorage.
          */
          return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
        },

        _setJSONItem: function(tabs) {
          /*
          Stores the JSON tabs in the localStorage.
          */
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs));
        },

        getTabsCount: function(tabs) {
          /*
          Returns the tabs count. If the param `tabs` is not
          passed in, it will get it from the storage.
          */
          tabs = tabs || this._getJSONItem();
          return Object.keys(tabs).length;
        },

        keepAlive: function() {
          /*
          Resets the tabs count and the other tabs will add themselves
          to the storage. This is to keep the storage consistent.
          */
          this.addThisTab({});
        },

        addThisTab: function(tabs) {
          /*
          Adds this tab to the storage.If the param `tabs` is not
          passed in, it will get it from the storage.
          */
          tabs = tabs || this._getJSONItem();
          tabs[this.id] = true;

          this._setJSONItem(tabs);
          this.updateScope(tabs);
        },

        remove: function() {
          /*
          Removes this tab from the storage and cancels the interval.
          */
          $interval.cancel(this._interval);
          var tabs = this._getJSONItem();
          delete tabs[this.id];
          this._setJSONItem(tabs);
        },

        updateScope: function(tabs) {
          /*
          Updates the rootScope variable.
          */
          $rootScope.multipleTabsOpen = this.getTabsCount(tabs);
        }
      };

      tab = new Tab();

      // every time a tab updates the localStorage, add this tab as well
      $window.addEventListener('storage', function(event) {
        if (event.key === LOCAL_STORAGE_KEY) {
          $rootScope.$apply(function() {
            tab.addThisTab();
          });
        }
      });

      // cleanup

      $window.onbeforeunload = function() {
        tab.remove();
      };

      $rootScope.$on('$destroy', function() {
        tab.remove();
      });
    }

  }]);
})();

(function () {
  'use strict';
  angular.module('cla.services')
    .service('AlternativeHelpService', [function() {
      this.clear = function() {
        this.selected_ids = {};
        this.selected_providers = {};
        this.notes = '';
      };

      this.get_selected_provider_ids = function () {
        var selected = [];

        for (var k in this.selected_providers) {
          if (this.selected_providers.hasOwnProperty(k) && this.selected_providers[k]) {
            selected.push(k);
          }
        }
        return selected;
      };

      this.selected_providers_length = function () {
        return Object.keys(this.selected_providers).length;
      };

      this.clear();
    }]);
})();


(function () {
  'use strict';

  var m = angular.module('cla.services');

  m.service('AssignProviderValidation', function () {
    var service = {};
    var _warned = false;
    var _models = {};
    var _warnings =  [];
    var _errors = [];
    var _required = [
      {object: 'case', field: 'notes', message: 'Case notes must be added to close a case'},
      {object: 'case', field: 'media_code', message: 'A media code is required to close a case'},
      {object: 'personal_details', field: 'full_name', message: 'Name is required to close a case'},
      {object: 'personal_details', field: 'dob', message: 'Date of birth is required to close a case'},
      {object: 'personal_details', field: 'mobile_phone', message: 'A contact number is required to close a case'},
      {object: 'adaptation_details', field: 'bsl_webcam,minicom,text_relay,skype_webcam,callback_preference,no_adaptations_required', message: 'At least one adaptation is required to close a case. If no adaptions are required please select "No adaptations required"'}
    ];
    var _recommended = [
      {object: 'personal_details', field: 'postcode', message: 'It is recommended to include postcode before closing a case'},
      {object: 'personal_details', field: 'street', message: 'It is recommended to include an address before closing a case'},
      {object: 'personal_details', field: 'ni_number', message: 'National Insurance number is not required to close a case but the specialist will ask for it once assigned'}
    ];

    function isValidValue (value) {
      if (value === undefined || (value !== undefined && !value)) {
        return false;
      }
      return true;
    }

    function setMessages (fields, list) {
      angular.forEach(fields, function (obj) {
        var isValue = false;
        if (obj.field.indexOf(',') > -1) {
          angular.forEach(obj.field.split(','), function (field) {
            if (isValidValue(_models[obj.object][field])) {
              isValue = true;
            }
          });
        } else {
          isValue = isValidValue(_models[obj.object][obj.field]);
        }
        if (!isValue) {
          list.push({message: obj.message});
        }
      });
    }

    service.validate = function (models) {
      // reset messages
      _warnings = [];
      _errors = [];

      // merge models to check
      _models = angular.extend(_models, models);

      // find errors
      setMessages(_required, _errors);
      setMessages(_recommended, _warnings);

      if ((_warnings.length === 0 && _errors.length === 0) || (_errors.length === 0 && _warned)) {
        return true;
      } else {
        return false;
      }
    };

    service.getErrors = function () {
      return _errors;
    };

    service.getWarnings = function () {
      return _warnings;
    };

    service.setWarned = function (value) {
      _warned = value;
    };

    service.getWarned = function () {
      return _warned;
    };

    return service;
  });
})();


(function () {
  'use strict';

  angular.module('cla.services')
    .factory('ClaPostalService', ['postal', function(postal) {
      return {
        publishHotKey: function (hotkey) {
          postal.publish({
            channel: 'HotKey',
            topic: hotkey.combo[0],
            data: {
              label: hotkey.description
            }
          });
        }
      };
    }]);
})();

(function () {
  'use strict';
  angular.module('cla.services')
    // this is the place to map properties / context between
    // eligibility check and diagnosis
    .service('EligibilityCheckService', function() {
      this.onEnter = function(eligibility_check, diagnosis) {
        if (!eligibility_check.category && diagnosis.category) {
          eligibility_check.category = diagnosis.category;
        }
      };
    });
})();


(function () {
  'use strict';
  // this is not really required yet but is being used as a central place
  // to hold historic state params. The idea is for this to save itself
  // into localStorage so even if user refreshes the page the back links
  // will go back to the right place.
  angular.module('cla.services')
    .factory('History', [function() {
      return {};
    }]);
})();

(function () {
  'use strict';

  angular.module('cla.services')
    .service('IncomeWarningsService', ['postal', '_', 'MoneyIntervalService', function(postal, _, MoneyIntervalService) {
      this.eligibilityCheck = {};
      this.warnings = {};

      this.isPassported = function () {
        return this.eligibilityCheck.on_passported_benefits && this.eligibilityCheck.on_passported_benefits !== '0';
      };

      this.hasPartner = function () {
        return this.eligibilityCheck.has_partner && this.eligibilityCheck.has_partner !== '0';
      };

      this.isComplete = function (fields) {
        var complete = true;
        angular.forEach(fields, function (v, k) {
          if (k !== 'self_employed' && v === null || v === undefined) {
            complete = false;
          }
        });
        return complete;
      };

      this.checkZeroIncome = function () {
        // fail if sections aren't complete
        if (!this.isComplete(this.eligibilityCheck.you.income)) {
          return false;
        }

        var total = this.eligibilityCheck.you.income.total;

        if (this.hasPartner()) {
          // fail if sections aren't complete
          if (!this.isComplete(this.eligibilityCheck.partner.income)) {
            return false;
          }
          // add partner income to total
          total += this.eligibilityCheck.partner.income.total;
        }

        return total <= 0 ? true : false;
      };

      this.checkDisposableIncome = function () {
        // fail if sections aren't complete
        if (!this.isComplete(this.eligibilityCheck.you.income) || !this.isComplete(this.eligibilityCheck.you.deductions)) {
          return false;
        }

        var total = this.eligibilityCheck.you.income.total;
        total -= this.eligibilityCheck.you.deductions.total;

        if (this.hasPartner()) {
          // fail if sections aren't complete
          if (!this.isComplete(this.eligibilityCheck.partner.income) || !this.isComplete(this.eligibilityCheck.partner.deductions)) {
            return false;
          }
          // add partner income to total
          total += this.eligibilityCheck.partner.income.total;
          total -= this.eligibilityCheck.partner.deductions.total;
        }

        return total < 0 ? true : false;
      };

      this.calculateHousingCosts = function (person) {
        var mortgage = this.eligibilityCheck[person].deductions.mortgage;
        var monthlyMortgage = MoneyIntervalService.asMonthly(mortgage.interval_period, mortgage.per_interval_value);

        var rent = this.eligibilityCheck[person].deductions.rent;
        var monthlyRent = MoneyIntervalService.asMonthly(rent.interval_period, rent.per_interval_value);

        return monthlyMortgage + monthlyRent;
      };

      this.checkHousing = function () {
        // fail if sections aren't complete
        if (!this.isComplete(this.eligibilityCheck.you.income) || !this.isComplete(this.eligibilityCheck.you.deductions)) {
          return false;
        }

        var totalIncome = this.eligibilityCheck.you.income.total;
        var housingCosts = this.calculateHousingCosts('you');

        if (this.hasPartner()) {
          // fail if sections aren't complete
          if (!this.isComplete(this.eligibilityCheck.partner.income) || !this.isComplete(this.eligibilityCheck.partner.deductions)) {
            return false;
          }
          // add partner income to total
          totalIncome += this.eligibilityCheck.partner.income.total;
          housingCosts += this.calculateHousingCosts('partner');
        }

        return (totalIncome / 3) < housingCosts ? true : false;
      };

      // public methods
      this.update = function (data) {
        var _warnings = {};

        if (data) {
          this.eligibilityCheck = data.eligibilityCheck;
        }

        if (!this.isPassported() && this.eligibilityCheck.you !== undefined && this.eligibilityCheck.you !== null) {
          _warnings.housing = this.checkHousing();
          _warnings.zeroIncome = this.checkZeroIncome();
          _warnings.negativeDisposable = this.checkDisposableIncome();
        }

        this.warnings = _.pick(_warnings, function (value) {
          return value;
        });

        postal.publish({
          channel: 'IncomeWarnings',
          topic: 'update',
          data: {
            warnings: this.warnings
          }
        });
      };

      this.setEligibilityCheck = function (eligibilityCheck) {
        this.eligibilityCheck = eligibilityCheck;
        this.update();
      };

      _.bindAll(this, 'update');

      // subscribe to EC save
      postal.subscribe({
        channel: 'EligibilityCheck',
        topic: 'save',
        callback: this.update
      });
    }]);
})();


'use strict';
(function(){

  var transformData = function(data, headers, fns) {
    if (angular.isFunction(fns)) {
      return fns(data, headers);
    }

    angular.forEach(fns, function(fn) {
      data = fn(data, headers);
    });

    return data;
  };

  // SERVICES
  angular.module('cla.services')
    .factory('Case', ['$http', '$claResource', 'DIAGNOSIS_SCOPE', 'ELIGIBILITY_STATES', 'REQUIRES_ACTION_BY', 'url_utils', 'moment', '$q',
      function($http, $claResource, DIAGNOSIS_SCOPE, ELIGIBILITY_STATES, REQUIRES_ACTION_BY, url_utils, Moment, $q) {

      var resource = $claResource('Case',
        url_utils.proxy('case/:caseref/'),
        {caseref: '@reference'},
        {
          'get':    {method:'GET', ignoreExceptions: [404]},
          'query':  {
            method: 'GET',
            isArray: false,
            transformResponse: function(data, headers) {
              if (!data) {
                return data;
              }
              var _data = transformData(
                    data, headers, $http.defaults.transformResponse
                  ),
                  results = [];

              angular.forEach(_data.results, function (item) {
                // jshint -W055
                results.push(new resource(item));
                // jshint +W055
              });

              _data.results = results;
              return _data;
            }
          },
          'query_future_callbacks': {
            method: 'GET',
            url: url_utils.proxy('case/future_callbacks/'),
            isArray: true
          },
          'save': {
            method: 'POST',
            eventAction: 'created'
          },
          'patch': {
            method: 'PATCH',
          },
          'case_details_patch': {
            method:'PATCH',
            transformRequest: function (data, headers) {
              return transformData({
                notes: data.notes,
                provider_notes: data.provider_notes
              }, headers, $http.defaults.transformRequest);
            },
            transformResponse: function () {
              return null;
            }
          },
          'set_matter_types': {
            method:'PATCH',
            transformRequest: function (data, headers) {
              return transformData({
                matter_type1: data.matter_type1,
                matter_type2: data.matter_type2
              }, headers, $http.defaults.transformRequest);
            }
          },
          'set_media_code': {
            method:'PATCH',
            transformRequest: function(data, headers) {
              return transformData({
                media_code: data.media_code
              }, headers, $http.defaults.transformRequest);
            }
          },
          'accept_case': {
            method:'POST',
            url: url_utils.proxy('case/:caseref/accept/'),
            transformRequest: function (data, headers) {
              return transformData({}, headers, $http.defaults.transformRequest);
            }
          }
        }
      );

      resource.prototype.$defer_assignment = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/defer_assignment/');
        return $http.post(url, data);
      };

      resource.prototype.$query = function(params) {
        var self = this;
        resource.query(params).$promise.then(function(data) {
          angular.extend(self, data);
        });
        return self;
      };

      resource.prototype.get_suggested_providers = function(as_of){
        var url = '/call_centre/proxy/case/'+this.reference+'/assign_suggest/',
          as_of_datetime;
        if (as_of) {
          as_of_datetime = new Moment(as_of);
          if (as_of_datetime.isValid()) {
            url += '?' + $.param({'as_of': as_of_datetime.format()});
          }
        }

        return $http.get(url);
      };

      resource.prototype.canBeCalledBack = function(){
        return this.callback_attempt < 3;
      };

      resource.prototype.createdByWeb = function () {
        return this.created_by === 'web';
      };

      resource.prototype.callStarted = function () {
        return this.call_started;
      };

      resource.prototype.getCallbackDatetime = function(){
        return this.requires_action_at;
      };

      resource.prototype.isFinalCallback = function(){
        return this.callback_attempt === 2;
      };

      resource.prototype.$assign = function(data){
        var url = url_utils.proxy('case/'+this.reference+'/assign/');
        return $http.post(url, data);
      };

      resource.prototype.isInScopeAndEligible = function(){
        return this.diagnosis_state === DIAGNOSIS_SCOPE.INSCOPE && this.eligibility_state === ELIGIBILITY_STATES.YES;
      };

      resource.prototype.$suspend_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/suspend/');
        return $http.post(url, data);
      };

      resource.prototype.$decline_help = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/decline_help/');
        return $http.post(url, data);
      };

      resource.prototype.$assign_alternative_help = function (data) {
        var url = url_utils.proxy('case/'+this.reference+'/assign_alternative_help/');
        return $http.post(url, data);
      };

      resource.prototype.$call_me_back = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/call_me_back/');
        return $http.post(url, data);
      };

      resource.prototype.$cancel_call_me_back = function() {
        var url = url_utils.proxy('case/'+this.reference+'/stop_call_me_back/');
        return $http.post(url, {
          action: 'cancel'
        });
      };

      resource.prototype.$complete_call_me_back = function() {
        var url = url_utils.proxy('case/'+this.reference+'/stop_call_me_back/');
        return $http.post(url, {
          action: 'complete'
        });
      };

      resource.prototype.$start_call = function() {
        var url = url_utils.proxy('case/'+this.reference+'/start_call/');
        return $http.post(url, {});
      };

      // Provider only endpoints
      resource.prototype.$reject_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/reject/');
        return $http.post(url, data);
      };

      resource.prototype.$close_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/close/');
        return $http.post(url, data);
      };

      resource.prototype.$close_case_debt_referral = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/close/');

        data = data || {};

        data.is_debt_referral = true;
        return $http.post(url, data);
      };

      resource.prototype.$reopen_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/reopen/');
        var deferred = $q.defer();
        $http.post(url, data).then(function(response) {
          // jshint -W055
          deferred.resolve(new resource(response.data));
          // jshint +W055
        }, function(response) {
          deferred.reject(response);
        });

        return deferred.promise;
      };

      resource.prototype.split_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/split/');
        return $http.post(url, data);
      };

      resource.prototype.$search_for_personal_details = function(person_q) {
        var url = url_utils.proxy('case/'+this.reference+'/search_for_personal_details/?person_q='+person_q);
        return $http.get(url);
      };

      resource.prototype.$link_personal_details = function(personal_details) {
        var url = url_utils.proxy('case/'+this.reference+'/link_personal_details/');
        return $http.post(url, {
          personal_details: personal_details
        });
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('EligibilityCheck', ['$http', '$claResource', 'url_utils', function($http, $claResource, url_utils) {
      var that = this, resource;

      this.BASE_URL = url_utils.proxy('case/:case_reference/eligibility_check/');

      resource = $claResource('EligibilityCheck', this.BASE_URL, {case_reference: '@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
        }
      };

      resource.prototype.validate = function(case_reference) {
        return $http.get(that.BASE_URL
          .replace(':case_reference', case_reference)+'validate/');
      };

      resource.prototype.isEligibilityTrue = function() {
        return this.state === 'yes';
      };
      resource.prototype.isEligibilityFalse = function() {
        return this.state === 'no';
      };
      resource.prototype.isEligibilityUnknown = function() {
        return (this.state === undefined || this.state === 'unknown');
      };
      return resource;
    }]);

  angular.module('cla.services')
    .factory('Diagnosis', ['$http', '$claResource', 'DIAGNOSIS_SCOPE', 'url_utils', function($http, $claResource, DIAGNOSIS_SCOPE, url_utils) {
      var resource;

      this.BASE_URL = url_utils.proxy('case/:case_reference/diagnosis/');

      resource = $claResource('Diagnosis', this.BASE_URL, {case_reference: '@case_reference'}, {
          // 'patch': {method: 'PATCH'},
          'delete': {method: 'DELETE',
            transformResponse: function() {
              return {};
            },
          },
          'move_down': {
            method:'POST',
            url: this.BASE_URL + 'move_down/'
          },
          'move_up': {
            method:'POST',
            url: this.BASE_URL + 'move_up/'
          },
        }
      );

      resource.prototype.isInScopeTrue = function() {
        return this.state === DIAGNOSIS_SCOPE.INSCOPE;
      };
      resource.prototype.isInScopeFalse = function() {
        return this.state === DIAGNOSIS_SCOPE.OUTOFSCOPE;
      };
      resource.prototype.isInScopeUnknown = function() {
        return (this.state === undefined || this.state === DIAGNOSIS_SCOPE.UNKNOWN);
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('PersonalDetails', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/personal_details/'), {case_reference:'@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
        }
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('Diversity', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/personal_details/set_diversity/'), {case_reference:'@case_reference'});

      return resource;
    }]);

  angular.module('cla.services')
    .factory('AdaptationsMetadata', ['$resource', 'url_utils', function ($resource, url_utils) {
      var resource = $resource(url_utils.proxy('adaptations/'), {}, {
        'options': {
          method: 'OPTIONS',
          cache: true
        }
      });

      return resource;
    }]);

  angular.module('cla.services')
    .factory('Adaptations', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/adaptation_details/'), {case_reference:'@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference},success, fail);
        }
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('EODDetails', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/eod_details/'), {case_reference: '@case_reference'}, {
        patch: {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail) {
        if(this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
        }
      };

      resource.prototype.isEODSet = function() {
        // true if any categories selected or notes are set
        return this.reference && this.categories && this.categories.length > 0 || this.notes && this.notes.length > 0;
      };

      resource.prototype.$eodBadge = function() {
        // returns either the number of selected categories or ! if there are only notes
        var badge = this.categories && this.categories.length;
        return badge || (this.notes && '!');
      };

      return resource;
    }]);

  angular.module('cla.services.operator')
    .factory('ComplaintCategory', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('complaints/category/'), null, {
        query: {
          method: 'GET',
          cache: true,
          isArray: true
        }
      });
    }]);

  angular.module('cla.services.operator')
    .factory('ComplaintConstants', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      var resource = $resource(url_utils.proxy('complaints/constants/'), null, {
        get: {
          method: 'GET',
          cache: true,
          isArray: false,
          transformResponse: function(data, headers) {
            if(!data) {
              return data;
            }
            var _data = transformData(
                data, headers, $http.defaults.transformResponse
              );
            // jshint -W055
            return new resource(_data);
            // jshint +W055
          }
        }
      });
      return resource;
    }]);

  angular.module('cla.services.operator')
    .factory('Complaint', ['$http', '$resource', 'postal', 'url_utils', function($http, $resource, postal, url_utils) {
      var transformRequest = function(data, headers) {
        // complaint needs transforming as there are read-only properties that the api doesn't accept
        return transformData({
          category: data.category,
          eod: data.eod,
          description: data.description,
          source: data.source,
          level: data.level,
          justified: data.justified,
          owner: data.owner
        }, headers, $http.defaults.transformRequest);
      };
      var resource = $resource(url_utils.proxy('complaints/complaint/:complaint_id/'), {
        complaint_id: '@id'
      }, {
        save: {
          method: 'POST',
          transformRequest: transformRequest
        },
        query: {
          method: 'GET',
          isArray: false,
          params: {page_size: 20},
          transformResponse: function(data, headers) {
            if(!data) {
              return data;
            }
            var _data = transformData(
                data, headers, $http.defaults.transformResponse
              ),
              results = [];

            angular.forEach(_data.results, function(item) {
              // jshint -W055
              results.push(new resource(item));
              // jshint +W055
            });

            _data.results = results;
            return _data;
          }
        },
        patch: {
          method: 'PATCH',
          transformRequest: transformRequest
        }
      });
      resource.prototype.$update = function(success, fail) {
        if(this.id) {
          return this.$patch({complaint_id: this.id}, success, fail);
        } else {
          return this.$save(success, fail);
        }
      };
      resource.prototype.$getLogs = function() {
        var ComplaintLogs = function(complaint_id) {
            this.complaint_id = complaint_id;
            this.logs = [];
          };
        ComplaintLogs.prototype.$refresh = function(success, fail) {
          var internalSuccess = angular.bind(this, function(response) {
            this.logs = response.data;
            if(typeof success !== 'undefined') {
              success(response);
            }
          });
          //fail = fail || angular.bind(this, function(response) {});
          $http.get(url_utils.proxy('complaints/complaint/' + this.complaint_id + '/logs/'))
            .then(internalSuccess, fail);
        };
        var complaintLogs = new ComplaintLogs(this.id);
        complaintLogs.$refresh();
        return complaintLogs;
      };
      resource.prototype.$addEvent = function(formData, success, fail) {
        $http.post(url_utils.proxy('complaints/complaint/' + this.id + '/add_event/'), formData).then(
          success, fail
        );
      };
      resource.prototype.$reopen = function(success, fail) {
        $http.post(url_utils.proxy('complaints/complaint/' + this.id + '/reopen/')).then(
          success, fail
        );
      };
      return resource;
    }]);

  angular.module('cla.services')
    .factory('ThirdParty', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/thirdparty_details/'), {case_reference:'@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
        }
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('Category', ['$http', '$resource', 'url_utils',
      function($http, $resource, url_utils) {
        return $resource(url_utils.proxy('category/:code/'), null, {
          query: {
            method: 'GET',
            cache: true,
            isArray: true
          }
        });
      }]);

  angular.module('cla.services')
    .factory('Log', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('case/:case_reference/logs/'), {case_reference: '@case_reference'});
    }]);

  angular.module('cla.services')
    .factory('Event', ['$http', 'url_utils', function($http, url_utils) {
      var defaults = {
        baseUrl: url_utils.proxy('event/')
      };

      function Event(options) {
        if (options === undefined) {
          options = {};
        }

        for (var i in defaults) {
          if (options[i] === undefined) {
            options[i] = defaults[i];
          }
        }

        this.options = options;

        return this;
      }

      Event.prototype.list_by_event_key = function(event_key, successCallback) {
        var url = this.options.baseUrl + event_key + '/';
        return $http.get(url).success(successCallback || angular.noop);
      };

      return Event;
    }]);

  angular.module('cla.services')
    .factory('Provider', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('provider/:id/'), {
      });
    }]);

  angular.module('cla.services')
    .factory('KnowledgeBase', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('knowledgebase/article/:articleref'), {articleref: '@reference'}, {
        get: {
          method: 'GET',
          isArray: false
        }
      });
    }]);

  angular.module('cla.services')
    .factory('KnowledgeBaseCategories', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('knowledgebase/category/'), {}, {
        get: {
          method: 'GET',
          isArray: true,
          cache: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('MatterType', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('mattertype/'), {}, {
        get: {
          method: 'GET',
          isArray: true,
          cache: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('MediaCode', ['$resource', 'url_utils', function ($resource, url_utils) {
      return $resource(url_utils.proxy('mediacode/'), {}, {
        get: {
          method: 'GET',
          isArray: true,
          cache: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('User', ['$resource', 'url_utils', '$http', function ($resource, url_utils, $http) {
      var resource = $resource(url_utils.proxy('user/'), {}, {
        get: {
          method: 'GET',
          isArray: false,
          url: url_utils.proxy('user/:username/'),
          params: {username: '@username'}
        },
        query: {
          method: 'GET',
          isArray: true
        },
        save: {
          method: 'POST',
          isArray: false
        }
      });

      resource.prototype.$resetPassword = function(old_password, new_password) {
        var url = url_utils.proxy('user/'+this.username+'/password_reset/'),
          data = {
            'new_password': new_password
          };
        if (old_password) {
          data.old_password = old_password;
        }
        return $http.post(url, data);
      };

      resource.prototype.$resetLockout = function() {
        var url = url_utils.proxy('user/'+this.username+'/reset_lockout/');
        return $http.post(url, {});
      };

      return resource;
    }]);


  angular.module('cla.services')
    .factory('CSVUpload', ['$http', '$resource', 'url_utils', function ($http, $resource, url_utils) {
      var resource = $resource(url_utils.proxy('csvupload/:id/'), {
        'id': '@id'
      }, {
        'put': {method: 'PUT'},
        'post': {method: 'POST', ignoreExceptions:[409]},
        'query':  {
            method: 'GET',
            isArray: false,
            transformResponse: function(data, headers) {
              if (!data) {
                return data;
              }
              var _data = transformData(
                    data, headers, $http.defaults.transformResponse
                  ),
                  results = [];

              angular.forEach(_data.results, function (item) {
                // jshint -W055
                results.push(new resource(item));
                // jshint +W055
              });

              _data.results = results;
              return _data;
            }
          }
      });

      return resource;
    }]);

  angular.module('cla.services.operator')
    .factory('Feedback', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      var resource = $resource(url_utils.proxy('feedback/:reference/'), {'reference': '@reference'}, {
        'query':  {
          method:'GET',
          isArray:false,
          transformResponse: function(data, headers) {
            if (!data) {
              return data;
            }

            var _data = transformData(
                  data, headers, $http.defaults.transformResponse
                ),
                results = [];

            angular.forEach(_data.results, function (item) {
              // jshint -W055
              results.push(new resource(item));
              // jshint +W055
            });

            _data.results = results;
            return _data;
          }
        },
        'patch': {method: 'PATCH'}
      });

      return resource;
    }]);

  angular.module('cla.services.provider')
    .factory('Feedback', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('case/:case/feedback/:reference/'), {
        'reference': '@reference',
        'case': '@case'
      }, {
        'patch': {method: 'PATCH'}
      });
    }]);

  angular.module('cla.services.operator')
    .factory('HistoricCase', ['$resource', 'url_utils', '$http', '$cacheFactory',
      function($resource, url_utils, $http, $cacheFactory) {
      var cache = $cacheFactory('historicCaseCache', {number: 5});
      var resource = $resource(url_utils.proxy('case_archive/:reference/'), {}, {
          'get': {
            method: 'GET',
            isArray: false,
          },
          'query':  {
            method: 'GET',
            isArray: false,
            'cache': cache,
            transformResponse: function(data, headers) {
              var _data = transformData(
                  data, headers, $http.defaults.transformResponse
                ),
                results = [];

              angular.forEach(_data.results, function (item) {
                // jshint -W055
                results.push(new resource(item));
                // jshint +W055
              });

              _data.results = results;
              return _data;
            }
          }
        }
      );
      return resource;
    }]);

  angular.module('cla.services')
    .factory('NotesHistory', ['$resource', 'url_utils', '$http', function($resource, url_utils, $http) {
      var resource = $resource(
        url_utils.proxy('case/:case_reference/notes_history/'),
        {case_reference: '@case_reference'},
        {
          'query':  {
            method:'GET',
            isArray:false,
            transformResponse: function(data, headers) {
              if (!data) {
                return data;
              }
              var _data = transformData(
                    data, headers, $http.defaults.transformResponse
                  ),
                  results = [];

              angular.forEach(_data.results, function (item) {
                // jshint -W055
                results.push(new resource(item));
                // jshint +W055
              });

              _data.results = results;
              return _data;
            }
          }
        }
      );

      return resource;
    }]);

  angular.module('cla.services')
    .factory('GuidanceNote', ['$resource', 'url_utils', function ($resource, url_utils) {
      return $resource(url_utils.proxy('guidance/note/:name'), {}, {
        get: {
          method: 'GET',
          cache: true
        },
        query: {
          method: 'GET',
          isArray: true,
          cache: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('GuidanceNoteRequestInterceptor', function () {
      return {
        request: function (config) {
          if (config.url.match(/guidance\/note\/.+/)) {
            config.url = config.url.replace(/%2F%23/, '#');
            config.url = config.url.replace(/(.*\/[^#]+)(#.*)?$/, '$1/$2');
            config.url = config.url.replace(/\/\//, '/');
          }
          return config;
        }
      };
    });

  angular.module('cla.services')
    .factory('Notification', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('notifications/notification/'), {}, {
        get: {
          method: 'GET',
          isArray: true,
          cache: false
        }
      });
    }]);

  angular.module('cla.services')
    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push('GuidanceNoteRequestInterceptor');
    }]);

})();

'use strict';
(function(){

  angular.module('cla.services')
    .factory('ModelsEventManager', ['postal', 'Log', function(postal, Log) {
      return function(case_, eligibility_check, diagnosis, log_set) {
        var subscriptions = [],
            configured = false;

        return {
          onEnter: function() {
            var self = this;

            if (configured) {
              throw 'ModelsEventManager already configured!';
            }
            configured = true;

            subscriptions.push(
              postal.subscribe({
                channel  : 'models',
                topic    : 'Diagnosis.saved',
                callback : function(_diagnosis) {
                  // NOTE: always check for object identity (_diagnosis === diagnosis)
                  // otherwise, you might end up updating other case's objects if the destroy
                  // callback doesn't get triggered for any reason
                  if (_diagnosis === diagnosis && _diagnosis.category) {
                    // update eligibility check
                    eligibility_check.category = _diagnosis.category;
                    if (eligibility_check.reference) {
                      eligibility_check.$update(case_.reference);
                    }

                    // update case matter types
                    if (_diagnosis.matter_type1 || _diagnosis.matter_type2) {
                      case_.matter_type1 = _diagnosis.matter_type1;
                      case_.matter_type2 = _diagnosis.matter_type2;
                      case_.$set_matter_types();
                    }
                  }
                }
              })
            );

            subscriptions.push(
              postal.subscribe({
                channel  : 'models',
                topic    : 'Log.refresh',
                callback : function() {
                  self.refreshLogs();
                }
              })
            );

            this.refreshLogs();
          },

          onExit: function() {
            angular.forEach(subscriptions, function(subscription) {
              subscription.unsubscribe();
            });
          },

          refreshLogs: function() {
            Log.query({case_reference: case_.reference}).$promise.then(function(data) {
              log_set.data = data;
            });
          }
        };
      };
    }]);

})();

(function () {
  'use strict';

  angular.module('cla.services')
    .factory('MoneyIntervalService', [function() {
      var factors = {
        'per_week': 52.0 / 12.0,
        'per_2week': 26.0 / 12.0,
        'per_4week': 13.0 / 12.0,
        'per_month': 1.0,
        'per_year': 1.0 / 12.0
      };

      return {
        asMonthly: function (interval, value) {
          return value * factors[interval];
        }
      };
    }]);
})();

'use strict';
(function(){
  // register the interceptor as a service
  angular.module('cla.services')
    .factory('cla.httpInterceptor.uniqueThrottleInterceptor', ['$injector', '$q', function ($injector, $q) {
      var DUPLICATE_REQUEST_STATUS_CODE = 420; // Twitter 'Enhance Your Calm' status code

      function compare_predicate(v, k) {
        return k.length > 0 && k[0] !== '$';
      }

      function makeEnhanceYourCalmResponse(config) {
        return {
          data: '',
          headers: {},
          status: DUPLICATE_REQUEST_STATUS_CODE,
          config: config
        };
      }

      function isRequestPending(config) {
        var $http = $injector.get('$http');
        var $state = $injector.get('$state');
        var pending = $http.pendingRequests.filter(function (pendingReqConfig) {
          return (
            pendingReqConfig.method === config.method &&
            pendingReqConfig.state === $state.current.name &&
            pendingReqConfig.url === config.url &&
            _.isEqual(_.pick(pendingReqConfig.data, compare_predicate), _.pick(config.data, compare_predicate))
          );
        });
        return pending.length > 0;
      }

      return {
        request:  function(config) {
          var deferred = $q.defer();

          if (config.method !== 'GET' && isRequestPending(config)) {
            deferred.reject(makeEnhanceYourCalmResponse(config));
          }
          deferred.resolve(config);
          return deferred.promise;
        }
      };
    }])

    .factory('cla.httpInterceptor', ['$q', 'flash', '$injector', '$sce', 'form_utils', 'url_utils', 'postal',
      function($q, flash, $injector, $sce, form_utils, url_utils, postal) {
        return {
          // optional method
          responseError: function(rejection) {
            var ignoreExceptions = rejection.config.ignoreExceptions || [];

            if (ignoreExceptions.indexOf(rejection.status) <= -1) {
              var msgs = {
                  500: 'Server error! Please try again later. If the problem persists, please contact the administrator.',
                  405: 'You are not allowed to perform this action on this resource.',
                  420: function () {
                    postal.publish({
                      channel: 'ServerError',
                      topic: 420
                    });
                  },
                  404: 'Resource cannot be found.',
                  403: 'You don\'t have permissions to access this page.',
                  401: function() {
                    postal.publish({
                      channel: 'Authentication',
                      topic: 'unauthorized'
                    });
                  },
                  400: angular.noop,
                  0: 'Your internet connection seems down, please check and try again.'
                },
                msg = msgs[rejection.status] || 'Error!';

              if (angular.isFunction(msg)) {
                msg = msg();
              }

              if (msg) {
                flash('error', msg);
              }
            }

            return $q.reject(rejection);
          }
        };
      }])

    .factory('cla.httpInterceptor.stateTagger', ['$injector', function($injector) {
      return {
        // optional method
        response: function(response) {
          var $state = $injector.get('$state');

          response.config.state = $state.current.name;

          return response;
        }
      };
    }])

    .factory('cla.httpInterceptor.sessionSecurity', ['postal', function(postal) {
      return {
        // optional method
        response: function(response) {
          var expiresResponse = response.headers()['session-expires-in'];
          if (expiresResponse) {
            postal.publish({
              channel: 'Authentication',
              topic: 'extend',
              data: {
                expiresIn: parseInt(expiresResponse)
              }
            });
          }
          // console.log(response.headers()['session-expires-in']);
          return response;
        }
      };
    }])

    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('cla.httpInterceptor.uniqueThrottleInterceptor');
      $httpProvider.interceptors.push('cla.httpInterceptor.stateTagger');
      $httpProvider.interceptors.push('cla.httpInterceptor.sessionSecurity');
      $httpProvider.interceptors.push('cla.httpInterceptor');

      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }]);
})();

(function(){
  'use strict';

  angular.module('cla.services')
    .factory('cla.notification', ['Notification', function(Notification) {
      return {
        list: function() {
          return Notification.get().$promise;
        }
      };
    }
  ]);
})();

(function () {
  'use strict';

  angular.module('cla.services')
    .factory('$claResource', ['$resource', 'postal', function($resource, postal) {
      var claResource = function(modelName, url, paramDefaults, actions, options) {
        var defaultActions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'DELETE'},
            'delete': {method: 'DELETE'}
          },
          eventAction;
        actions = angular.extend({}, defaultActions, actions);

        angular.forEach(actions, function(action) {

          eventAction = null;

          if (/^(POST|PUT|PATCH)$/i.test(action.method)) {
            eventAction = 'saved';
          } else if (action.method === 'DELETE') {
            eventAction = 'deleted';
          }

          if (action.eventAction) {
            eventAction = action.eventAction;
          }

          if (eventAction) {
            action.interceptor = action.interceptor || {};
            if (action.interceptor.response) {
              console.log('TODO: not yet implemented, overriding your interceptor :-/ ...');
            }

            action.interceptor.response = (function(modelName, eventAction) {
              return function(response) {
                postal.publish({
                  channel : 'models',
                  topic   : modelName+'.'+eventAction,
                  data    : response.resource
                });

                return response.resource;
              };
            })(modelName, eventAction);
          }
        });

        return $resource(url, paramDefaults, actions, options);
      };

      return claResource;
    }]);
})();

/* jshint unused: false */
(function(){
  'use strict';

  angular.module('cla.services')
    .factory('cla.bus', ['postal', '$rootScope', '_', 'appUtils', function (postal, $rootScope, _, appUtils) {

      function init(user) {
        // io is global reference to socket.io
        var host = $('head').data('socketioServer');
        host = host.replace(/^https?:/, window.location.protocol);
        var socket = io.connect(host);
        var SYSTEM_MSG_OPTIONS = {  // hardcoded for now for security reasons
          '1': {
            text: 'Your version of the software is now <strong>out of date</strong>. Please <a href="" target="_self">refresh your browser</a> to correct this problem',
            closeable: false
          }
        };

        // USER IDENTIFICATION

        socket.on('connect', function() {
          socket.emit('identify', {
            'username': user.username,
            'usertype': appUtils.appName,
            'appVersion': appUtils.getVersion()
          });
        });

        socket.on('systemMessage', function(msgID) {
          var msg = SYSTEM_MSG_OPTIONS[msgID];
          if (typeof msg !== undefined) {
            $rootScope.$emit('system:message', msg.text, msg.closeable);
          }
        });

        // VIEWING CASE

        postal.subscribe({
          channel: 'system',
          topic: 'case.startViewing',
          callback: function(data) {
            socket.emit('startViewingCase', data.reference);
          }
        });

        postal.subscribe({
          channel: 'system',
          topic: 'case.stopViewing',
          callback: function(data) {
            socket.emit('stopViewingCase', data.reference);
          }
        });

        socket.on('peopleViewing', function(data) {
          $rootScope.peopleViewingCase = _.without(data, $rootScope.user.username);
          $rootScope.$apply();
          // console.log('got people viewing case: '+$rootScope.peopleViewingCase);
        });

        socket.on('notification', function(data) {
          $rootScope.notifications = data;
          $rootScope.$apply();
        });
      }

      return {
        install: function() {

          postal.subscribe({
            channel: 'system',
            topic: 'user.identified',
            callback: function(user) {
              init(user);
            }
          });

        }
      };
    }]);
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || {};

    states.PageNotfound = {
      name: '404',
      url: AppSettings.BASE_URL + 'page-not-found/',
      templateUrl: '404.html'
    };

    mod.states = states;
  }]);
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailAlternativeHelp = {
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
        CanAccess: ['$q', 'diagnosis', 'case', 'personal_details', 'postal', function ($q, diagnosis, $case, personal_details, postal) {
          var deferred = $q.defer();
          var errors = '';

          if (!diagnosis || !diagnosis.category) {
            errors += '<p>Cannot assign alternative help without setting area of law. <strong>Please complete diagnosis</strong>.</p><p>If diagnosis has been completed but you are still getting this message please escalate so missing data can be added to diagnosis engine.</p>';
            // track which data hasn't been completed
            postal.publish({
              channel: 'ConfirmationModal',
              topic: 'error',
              data: {
                label: 'Diagnosis missing for alternative help'
              }
            });
          }

          if (!personal_details.full_name || (!personal_details.postcode && !personal_details.mobile_phone)) {
            errors += '<p>You must collect at least <strong>a name</strong> and <strong>a postcode or phone number</strong> from the client before assigning alternative help.</p>';
            // track which data hasn't been completed
            postal.publish({
              channel: 'ConfirmationModal',
              topic: 'error',
              data: {
                label: 'Personal details missing for alternative help'
              }
            });
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

    mod.states = states;
  });
})();

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

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityDetails = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.details',
      url: 'details/'
    };

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityExpenses = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.expenses',
      url: 'expenses/'
    };

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityFinances = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.finances',
      url: 'finances/'
    };

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibilityIncome = {
      parent: 'case_detail.edit.eligibility',
      name: 'case_detail.edit.eligibility.income',
      url: 'income/'
    };

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEditEligibility = {
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

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.CaseDetailEdit = {
      parent: 'case_detail',
      name: 'case_detail.edit',
      url: '',
      views: {
        '@case_detail': {
          templateUrl: 'case_detail.edit.html',
          controller: 'CaseDetailEditCtrl'
        }
      }
    };

    mod.states = states;
  });
})();

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
        eod_details: ['case', 'EODDetails', function(case_, EODDetails) {
          return case_.eod_details ? EODDetails.get({case_reference: case_.reference}).$promise : new EODDetails({case_reference: case_.reference});
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
                  var params = self.getCaseQueryParams($stateParams, {
                    '_passive': '1'
                  });
                  cases.$query(params);
                }
              };

          this.refreshCastListInterval = $interval(refreshCases, AppSettings.caseListRefreshDelay);
        }
      }],
      onExit: ['$interval', function($interval) {
        $interval.cancel(this.refreshCastListInterval);
      }],
      getCaseQueryParams: function($stateParams, extraParams) {
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
          angular.extend(params, extraParams || {});

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

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(function () {
    var states = mod.states || {};

    states.Layout = {
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

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || {};

    states.UserList = {
      name: 'user_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'user/?search',
      templateUrl: 'user_list.html',
      controller: 'UserListCtrl',
      resolve: {
        users: ['User', 'user', '$q', function(User, user, $q){

          var deferred = $q.defer();

          if (!user.is_manager) {
            // reject promise and handle in $stateChangeError
            deferred.reject({
              msg: 'You must be a manager to edit users.'
            });
            return deferred.promise;
          }
          return User.query().$promise;
        }]
      }
    };

    mod.states = states;
  }]);
})();

(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('AssignProviderCtrl', ['$scope', '_', '$state', 'form_utils', 'flash', 'MatterTypes', 'Suggestions', 'postal',
      function($scope, _, $state, form_utils, flash, MatterTypes, Suggestions, postal) {
        $scope.is_manual = false;
        $scope.is_manual_ref = false;
        $scope.is_spor = false;
        $scope.is_urgent = false;
        $scope.suggested_providers = [];
        $scope.matter1_types = _.where(MatterTypes, {level: 1});
        $scope.matter2_types = _.where(MatterTypes, {level: 2});

        // if provider has already been assigned
        if ($scope.case.provider) {
          $scope.selected_provider = _.findWhere(Suggestions.suitable_providers, {id: $scope.case.provider});
        } else {
          $scope.suggested_providers = Suggestions.suggested_provider === null ? Suggestions.suitable_providers : _.reject(Suggestions.suitable_providers, {
            id: Suggestions.suggested_provider.id
          });
          $scope.suggested_provider = $scope.selected_provider = Suggestions.suggested_provider;
          $scope.is_manual = Suggestions.suggested_provider === null;
        }

        $scope.assignManually = function(choice) {
          $scope.is_manual = choice;

          postal.publish({channel: 'AssignProvider', topic: 'manual', data: {label: choice}});

          // reset selected to suggested provider
          if (!choice) {
            $scope.is_manual_ref = false;
            $scope.selected_provider = $scope.suggested_provider;
            $scope.provider_search = '';
          }
        };

        $scope.getMTDescription = function (code) {
          var type = _.findWhere(MatterTypes, {code: code});
          return type ? type.description : '';
        };

        $scope.canAssign = function () {
          if($scope.suggested_providers.length > 0 || $scope.suggested_provider || !$scope.case.provider) {
            return true;
          }

          return false;
        };

        $scope.assign = function(form) {
          var data = {
            provider_id: $scope.selected_provider.id,
            is_manual_ref: $scope.is_manual_ref,
            is_manual: $scope.is_manual,
            is_spor: $scope.is_spor,
            is_urgent: $scope.is_urgent
          };

          if ($scope.is_manual) {
            data.notes = $scope.notes;
          }

          $scope.case.$set_matter_types().then(
            function () {
              $scope.case.$assign(data).then(
                function(response) {
                  $state.go('case_list');
                  flash('success', 'Case ' + $scope.case.reference + ' assigned to ' + response.data.name);
                },
                function(data) {
                  form_utils.ctrlFormErrorCallback($scope, data, form);
                }
              );
            },
            function (data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            }
          );
        };
      }
    ]);
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CallbacksCtrl',
      ['$scope', 'cases', '_',
        function ($scope, cases, _) {
          // map cases to allow counting by group
          var allSlots = cases.map(function ($case) {
            var callbackDate = new Date($case.requires_action_at);
            return {
              slot: callbackDate.getDay() + '-' + callbackDate.getHours(),
              case: $case
            };
          });

          // get count
          var countedSlots = _.countBy(allSlots, function (obj) {
            return obj.slot;
          });

          // map to required format for heatmap
          $scope.slotData = _.map(countedSlots, function (value, key){
            var slot = key.split('-');
            return {
              day: parseInt(slot[0]),
              hour: parseInt(slot[1]),
              value: value
            };
          });
          // all cases
          $scope.callbackCases = cases;
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CaseDeferSpecialistsCtrl',
      ['$scope', '$state', 'flash',
        function($scope, $state, flash) {

          $scope.defer = function() {
            $scope.case.$defer_assignment({
              'notes': $scope.notes
            }).then(function() {
              $state.go('case_list');
              flash('success', 'Case '+$scope.case.reference+' deferred successfully');
            });
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CaseDetailDeclineHelpCtrl',
      ['$scope', '$uibModal', '$q', '$state', 'flash',
        function($scope, $uibModal, $q, $state, flash){
          $scope.decline_help = function(notes) {
            var parentQ = $q.when(true);
            var modalOpts = {
              templateUrl: 'case_detail.outcome_modal.html',
              controller: 'OutcomesModalCtl',
              resolve: {
                tplVars: function() {
                  return {
                    'title': 'Decline help'
                  };
                },
                case: function() { return $scope.case; },
                eod_details: function() {return null;},
                Complaint: function() {return null;},
                event_key: function() { return 'decline_help'; },  //this is also the function name on Case model
                notes: function() { return notes || ''; },
                outcome_codes: ['Event', function (Event) {
                  return new Event().list_by_event_key('decline_help').then(function (response) {
                    return response.data;
                  });
                }]
              }
            };
            var onSuccess = function (result) {
              if (result) {
                flash('success', 'Declined help for Case ' + $scope.case.reference);
              } else {
                flash('error', 'There was a problem declining help on this case');
              }
              $state.go('case_list');
            };

            if ($scope.$parent && $scope.$parent.decline_help) {
              parentQ = $scope.$parent.decline_help();
            }

            parentQ.then(function () {
              $uibModal.open(modalOpts).result.then(onSuccess);
            });
          };
        }
      ]
    );
})();

(function() {
  'use strict';

  var maps = {},
    setupMappedValues = function(complaintConstants) {
      angular.forEach(['justified', 'resolved', 'sources', 'levels'], function(key) {
        maps[key] = maps[key] || {};
        angular.forEach(complaintConstants[key], function(data) {
          maps[key][data.value] = data.description;
        });
      });
    },
    addCategoriesToMappedValues = function(complaintCategories) {
      maps.categories = {};
      angular.forEach(complaintCategories, function(data) {
        maps.categories[data.id] = data.name;
      });
    },
    displayMappedValue = function(key, data) {
      return maps[key][data] || '';
    };

  angular.module('cla.controllers.operator')
    .controller('ComplaintsListCtrl',
      ['$scope', '$state', '$stateParams', 'complaintConstants', 'complaintsList', 'goToComplaint',
        function($scope, $state, $stateParams, complaintConstants, complaintsList, goToComplaint) {
          setupMappedValues(complaintConstants);
          $scope.displayMappedValue = displayMappedValue;

          $scope.complaintsList = complaintsList;
          $scope.goToComplaint = goToComplaint;

          $scope.currentPage = $stateParams.page || 1;
          $scope.currentOrdering = $stateParams.ordering || '-created';
          $scope.showingClosed = $stateParams.show_closed === 'True';
          $scope.pageChanged = function(newPage) {
            $scope.currentPage = newPage;
            updatePage();
          };
          $scope.orderToggle = function(ordering) {
            if($scope.currentOrdering === ordering) {
              $scope.currentOrdering = '-' + ordering;
            } else {
              $scope.currentOrdering = ordering;
            }
            $scope.currentPage = 1;
            updatePage();
          };
          $scope.orderClass = function(ordering) {
            if($scope.currentOrdering === ordering) {
              return 'u-sortAsc';
            } else if($scope.currentOrdering === '-' + ordering) {
              return 'u-sortDesc';
            }
          };
          $scope.toggleShowClosed = function() {
            $scope.showingClosed = !$scope.showingClosed;
            updatePage();
          };

          function updatePage() {
            var params = {
              page: $scope.currentPage,
              ordering: $scope.currentOrdering,
              show_closed: $scope.showingClosed ? 'True': null
            };
            $state.go($state.current.name, params, {
              reload: true
            });
          }

          $scope.statusClass = function(complaint) {
            switch(complaint.status_label) {
              case 'resolved':
              case 'unresolved':
              case 'voided':
                return 'is-complete';
              case 'pending':
                return '';
              case 'received':
                return 'is-new';
              default:
                return '';
            }
          };
        }
      ])
    .controller('ComplaintCtrl',
      ['$scope', '$state', '$stateParams', 'managers', 'complaintCategories', 'complaintConstants', 'complaint', 'complaintLogs', 'personal_details', 'goToComplaint', 'goToCase', 'form_utils', 'flash', 'postal', 'History',
        function($scope, $state, $stateParams, managers, complaintCategories, complaintConstants, complaint, complaintLogs, personal_details, goToComplaint, goToCase, form_utils, flash, postal, History) {
          setupMappedValues(complaintConstants);
          addCategoriesToMappedValues(complaintCategories);
          $scope.displayMappedValue = displayMappedValue;

          $scope.complaintCategories = complaintCategories;
          $scope.complaintConstants = complaintConstants;

          $scope.managers = managers;
          $scope.findManager = function(username) {
            var userObject = null;
            angular.forEach(managers, function(manager) {
              if(manager.username === username) {
                userObject = manager;
                return false;
              }
            });
            return userObject;
          };
          $scope.getUserDisplayName = function(userObject) {
            if(userObject.first_name || userObject.last_name) {
              return (userObject.first_name + ' ' + userObject.last_name).trim();
            }
            return userObject.username || 'Unknown';
          };

          $scope.goToCase = goToCase;
          $scope.complaintsListStateParams = History.complaintsListStateParams;

          $scope.complaint = complaint;
          $scope.complaintLogs = complaintLogs;
          $scope.personal_details = personal_details;

          $scope.displayStatus = function() {
            return 'Complaint ' + $scope.complaint.status_label;
          };
          $scope.statusClass = function() {
            switch($scope.complaint.status_label) {
              case 'resolved':
                return 'Icon--tick Icon--green';
              case 'unresolved':
                return 'Icon--tick Icon--red';
              case 'pending':
                return 'Icon--edit';
              case 'received':
                /* falls through */
              default:
                return 'Icon--alert Icon--orange';
            }
          };

          $scope.showDetailsForm = function(complaintDetailsFrm) {
            if(complaint.closed !== null) {
              flash('error', 'Complaint is closed, reopen it to edit the details');
              return;
            }
            if($scope.complaint.justified === null) {
                $scope.complaint.justified = '';
            } else {
                $scope.complaint.justified = $scope.complaint.justified + '';
            }
            complaintDetailsFrm.$show();
          };
          $scope.cancelComplaintDetails = function(complaintDetailsFrm) {
            complaintDetailsFrm.$cancel();
          };

          $scope.validateComplaintDetails = function(isValid) {
            return isValid ? true : 'false';
          };
          $scope.saveComplaintDetails = function(complaintDetailsFrm) {
            switch($scope.complaint.justified) {
              case 'true':
                $scope.complaint.justified = true;
                break;
              case 'false':
                $scope.complaint.justified = false;
                break;
              default:
                $scope.complaint.justified = null;
            }

            $scope.complaint.$update(function() {
              postal.publish({
                channel: 'Complaint',
                topic: 'save',
                data: $scope.complaint
              });
              flash('success', 'Complaint details saved');
            }, function(response) {
              form_utils.ctrlFormErrorCallback($scope, response, complaintDetailsFrm);
              flash('error', 'Complaint details not saved');
            });
          };

          $scope.errors = {};
          $scope.currentAction = {};
          function resetActionForm() {
            $scope.currentAction.event_code = null;
            $scope.currentAction.notes = '';
            delete $scope.currentAction.resolved;
          }
          $scope.saveAction = function(actionFrm) {
            complaint.$addEvent($scope.currentAction, function() {
              $scope.complaint.$get();
              resetActionForm();
              postal.publish({
                channel: 'models',
                topic: 'Log.refresh'
              });
              flash('success', 'Complaint action saved');
            }, function(response) {
              form_utils.ctrlFormErrorCallback($scope, response, actionFrm);
            });
          };
          resetActionForm();

          $scope.reopenComplaint = function() {
            complaint.$reopen(function() {
              $scope.complaint.$get();
              resetActionForm();
              postal.publish({
                channel: 'models',
                topic: 'Log.refresh'
              });
              flash('success', 'Complaint reopened');
            }, function() {
              flash('warning', 'Complaint could not be reopened');
            });
          };

          $scope.getLogMessages = function(action, key) {
            var messages = {
              COMPLAINT_CREATED: {
                logHeading: 'Complaint created'
              },
              OWNER_SET: {
                logHeading: 'Complaint owner set'
              },
              COMPLAINT_REOPENED: {
                logHeading: 'Complaint reopened'
              },
              COMPLAINT_NOTE: {
                logHeading: '',
                notesPlaceholder: 'Enter notes',
                button: 'Save note'
              },
              HOLDING_LETTER_SENT: {
                logHeading: 'Holding letter sent',
                notesPlaceholder: 'Enter notes and copy of letter',
                button: 'Save letter'
              },
              TRANSFERRED_TO_SPECIALIST: {
                logHeading: 'Transferred to specialist',
                notesPlaceholder: 'Enter notes',
                button: 'Save'
              },
              FULL_RESPONSE_SENT: {
                logHeading: 'Full response sent',
                notesPlaceholder: 'Enter notes and copy of letter',
                button: 'Save letter'
              },
              COMPLAINT_CLOSED: {
                logHeading: 'Complaint closed',
                notesPlaceholder: 'Enter notes',
                button: 'Close complaint'
              },
              COMPLAINT_VOID: {
                logHeading: 'Complaint voided',
                notesPlaceholder: 'Enter reasons for voiding',
                button: 'Void complaint'
              }
            }[action];
            messages = messages || {
              logHeading: '',
              notesPlaceholder: 'Enter notes',
              button: 'Save'
            };
            if(typeof key !== 'undefined') {
              return messages[key];
            }
            return messages;
          };
        }
      ]);
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('ConfirmationCtrl', ['$scope', 'tplVars', function ($scope, tplVars) {
      $scope.tplVars = angular.extend({
        title: 'Confirmation required',
        buttonText: 'Continue',
        message: 'Please ensure you are comfortable with the action you are doing.'
      }, tplVars);

      $scope.cancel = function () {
        $scope.$dismiss('cancel');
      };

      $scope.confirm = function () {
        $scope.$close(true);
      };
    }]
  );
})();

(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('DiversityCtrl', ['$scope', 'Diversity', 'GENDERS', 'ETHNICITIES', 'DISABILITIES', 'RELIGIONS', 'SEXUAL_ORIENTATIONS',
      function($scope, Diversity, GENDERS, ETHNICITIES, DISABILITIES, RELIGIONS, SEXUAL_ORIENTATIONS) {
        $scope.current = {
          step: 1,
          answer: undefined
        };
        $scope.sections = [
          {
            title: 'Gender',
            script: '<p>The first category is gender. Which of the following describes how you think of yourself?</p>',
            name: 'gender',
            options: GENDERS
          },
          {
            title: 'Ethnic origin',
            script: '<p>Secondly, what is your ethnicity?</p><p><em>If a client has trouble answering this question, ask "<strong>Can you tell me which of these options best describes your ethnicity?</strong>" and then read out all the options. If the client does not wish to say, select "<strong>Prefer not to say</strong>". If the client\'s ethnicity is not on the list, select "<strong>Other</strong>".</em></p>',
            name: 'ethnicity',
            options: ETHNICITIES
          },
          {
            title: 'Disabilities',
            name: 'disability',
            script: '<p>Do you consider yourself to be disabled?</p><p><em>If the client answers "<strong>No</strong>", select "<strong>Not considered disabled</strong>".</em></p><p><em>If the client answers "<strong>Yes</strong>", ask: "<strong>How would you describe your disability?</strong>" (If a client has trouble answering this question, ask "<strong>Can you tell me which of these options best describes your disability?</strong>" and then read out all the options. If the client does not wish to say, select "<strong>Prefer not to say</strong>". If the client\'s disability is not on the list, select "<strong>Other</strong>".)</em></p>',
            options: DISABILITIES
          },
          {
            title: 'Religion / belief',
            name: 'religion',
            script: '<p>What is your religion or belief?</p><p><em>If a client has trouble answering this question, ask "<strong>Can you tell me which of these options best describes your religion or belief?</strong>" and then read out all the options. If the client does not wish to say, select "<strong>Prefer not to say</strong>". If the client\'s religion or belief is not on the list, select "<strong>Other</strong>".</em></p>',
            options: RELIGIONS
          },
          {
            title: 'Sexual orientation',
            name: 'sexual_orientation',
            script: '<p>What is your sexual orientation?</p><p><em>(If a client does not understand this question, please give them examples of some of the answers to direct the client. You do not need to read out the whole list but it may be appropriate to prompt the client by saying "<strong>For example, Heterosexual or Bisexual?</strong>" If the client does not wish to say, please select "Prefer not to say". If the client states a sexual orientation which is not on the list, please select "Other".)</em></p>',
            options: SEXUAL_ORIENTATIONS
          }
        ];

        var prepareData = function () {
          var data = {};
          for (var i=0; i<$scope.sections.length; i+=1) {
            var section = $scope.sections[i];
            data[section.name] = section.answer;
          }
          return data;
        };

        $scope.getDisplayLabel = function(val, list) {
          var item = _.findWhere(list, {value: val});

          if (item) {
            return item.text;
          }
        };

        $scope.gotoStep = function (step) {
          $scope.submitted = false;

          if ($scope.sections[step-1] !== undefined && $scope.sections[step-1].hasOwnProperty('answer')) {
            $scope.current.answer = $scope.sections[step-1].answer;
          } else {
            $scope.current.answer = null;
          }

          $scope.current.step = step;
        };

        $scope.nextStep = function (valid) {
          if ($scope.current.step < $scope.sections.length+1 && valid) {
            $scope.sections[$scope.current.step-1].answer = $scope.current.answer;
            $scope.gotoStep($scope.current.step+1);
          } else {
            $scope.submitted = true;
          }
        };

        $scope.previousStep = function () {
          if ($scope.current.step > 1) {
            $scope.gotoStep($scope.current.step-1);
          }
        };

        $scope.save = function (valid) {
          if (valid) {
            $scope.nextStep(valid);

            var data = prepareData();
            data.case_reference = $scope.case.reference;

            var diversity = new Diversity(data);
            diversity.$save(function () {
              $scope.personal_details.has_diversity = true;
            });
          } else {
            $scope.submitted = true;
          }
        };
      }
    ]);
})();

(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('EODDetailsModalCtrl',
      ['$scope', '$state', 'case', 'eod_details', 'Complaint', '$uibModalInstance', 'EXPRESSIONS_OF_DISSATISFACTION', 'EXPRESSIONS_OF_DISSATISFACTION_FLAGS', '$q', '$timeout', 'flash', 'postal',
        function($scope, $state, $case, eod_details, Complaint, $uibModalInstance, EXPRESSIONS_OF_DISSATISFACTION, EXPRESSIONS_OF_DISSATISFACTION_FLAGS, $q, $timeout, flash, postal) {
          $scope.case = $case;
          $scope.EXPRESSIONS_OF_DISSATISFACTION = EXPRESSIONS_OF_DISSATISFACTION;

          // focus on search field on open
          $uibModalInstance.opened.then(function() {
            $timeout(function() {
              angular.element('#eod-modal-search').focus();
            }, 50);
          });

          $scope.eod_details_model = {
            categories: {},
            notes: eod_details.notes || ''
          };
          angular.forEach(eod_details.categories, function(category) {
            $scope.eod_details_model.categories[category.category] = {
              is_major: category.is_major
            };
          });

          $scope.isCategorySelected = function(category) {
            return $scope.eod_details_model.categories[category] || false;
          };

          $scope.categoryNeedsMajorFlag = function(category) {
            if(EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category]) {
              return EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].length > 1;
            }
            return null;
          };

          $scope.isCategoryFlaggedMajor = function(category) {
            if(!$scope.eod_details_model.categories[category]) {
              return false;
            }
            return $scope.eod_details_model.categories[category].is_major || false;
          };

          $scope.toggleCategory = function(category) {
            if($scope.eod_details_model.categories[category]) {
              delete $scope.eod_details_model.categories[category];
            } else {
              var defaultMajorFlag = false;
              if(EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].length === 1 &&
                EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].indexOf('major') > -1) {
                defaultMajorFlag = true;
              }
              $scope.eod_details_model.categories[category] = {
                is_major: defaultMajorFlag
              };
            }
          };

          $scope.toggleCategoryMajorFlag = function(category) {
            if(!$scope.eod_details_model.categories[category] || !EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category] || EXPRESSIONS_OF_DISSATISFACTION_FLAGS[category].length < 2) {
              return;
            }
            $scope.eod_details_model.categories[category].is_major = !$scope.eod_details_model.categories[category].is_major;
          };

          $scope.submit = function(theForm, action) {
            if(theForm.$valid) {
              var eodPromise = $q.defer();

              eod_details.notes = $scope.eod_details_model.notes;
              eod_details.categories = [];
              angular.forEach($scope.eod_details_model.categories, function(category_details, category_key) {
                eod_details.categories.push({
                  category: category_key,
                  is_major: category_details.is_major
                });
              });

              eod_details.$update($scope.case.reference, function() {
                postal.publish({channel: 'EOD', topic: 'save'});
                eodPromise.resolve();
              }, function() {
                eodPromise.reject('fail');
              });

              var promises = [eodPromise.promise];
              if(action === 'escalate') {
                var complaintPromise = $q.defer();
                promises.push(complaintPromise);
                eodPromise.promise.then(function() {
                  var complaint = new Complaint({
                    eod: eod_details.reference,
                    // copy EOD notes into complaint description
                    description: eod_details.notes
                  });
                  complaint.$update(function() {
                    // could go $case.$get but that might wipe other changes
                    $case.complaint_flag = true;
                    $case.complaint_count = ($case.complaint_count || 0) + 1;

                    postal.publish({
                      channel: 'Complaint',
                      topic: 'save',
                      data: complaint
                    });
                    flash('success', 'EOD escalated to complaint');
                    complaintPromise.resolve();
                  }, function() {
                    flash('error', 'EOD not escalated to complaint');
                    complaintPromise.reject('fail');
                  });
                });
              }

              var response = $q.all(promises);
              $scope.$close(response);
            }
          };

          $scope.cancel = function(nextState, stateParams) {
            if(nextState) {
              nextState = {
                state: nextState,
                params: stateParams
              };
            }
            $scope.$dismiss(nextState);
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('FeedbackListCtrl',
      ['$scope', 'feedback', 'FEEDBACK_ISSUE', '$stateParams', '$state', 'moment',
        function($scope, feedback, FEEDBACK_ISSUE, $stateParams, $state, Moment) {
          $scope.feedbackList = feedback;
          $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
          $scope.startDate = $stateParams.start ? new Moment($stateParams.start).format('DD/MM/YYYY') : null;
          $scope.endDate = $stateParams.end ? new Moment($stateParams.end).format('DD/MM/YYYY') : null;
          $scope.currentPage = $stateParams.page || 1;

          $scope.hideResolved = $stateParams.hide_resolved === 'true';

          function updatePage() {
            $state.go($state.current, {
              'page': $scope.currentPage
            });
          }

          $scope.pageChanged = function(newPage) {
            $scope.currentPage = newPage;
            updatePage();
          };

          $scope.setJustified = function (feedbackItem, value) {
            feedbackItem.justified = value;
            return feedbackItem.$patch();
          };

          $scope.toggleResolved = function (feedbackItem) {
            console.log(feedbackItem)
            console.log('called');
            feedbackItem.resolved = !feedbackItem.resolved;
            return feedbackItem.$patch();
          };

          $scope.toggleResolvedState = function () {
            $scope.hideResolved = !$scope.hideResolved;
            $stateParams.hide_resolved = $scope.hideResolved;
            $state.go($state.current, $stateParams, {reload: true});
          };

          $scope.showRow = function (feedbackItem) {
            if ($scope.hideResolved) {
              return !feedbackItem.resolved;
            }
            return true;
          };

          $scope.filter = function () {
            var start = $scope.startDate ? new Moment($scope.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD H:m') : null;
            var end = $scope.endDate ? new Moment($scope.endDate, 'DD/MM/YYYY').hour(23).minute(59).format('YYYY-MM-DD H:m') : null;

            $state.go($state.current, {
              start: start,
              end: end,
            }, {
              reload: true,
              inherit: false,
              notify: true
            });
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('HistoricCaseDetailCtrl',
    ['$scope', 'historicCase', 'History',
      function ($scope, historicCase, History) {
        $scope.caseListStateParams = History.caseListStateParams;
        $scope.historicCase = historicCase;
      }
    ]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('HistoricCaseListCtrl',
    ['$scope', 'historicCases', '$stateParams', '$state', 'History',
      function ($scope, historicCases, $stateParams, $state, History) {
        $scope.caseListStateParams = History.caseListStateParams;
        $scope.historicCases = historicCases;
        $scope.currentPage = $stateParams.page || 1;
        $scope.search = $stateParams.search;

        function _updatePage() {
          $state.go($state.current, {
            page: $scope.currentPage,
            search: $scope.search
          });
        }

        $scope.pageChanged = function(newPage) {
          $scope.currentPage = newPage;
          _updatePage();
        };
      }
    ]
  );
})();

(function(){
  'use strict';


  angular.module('cla.controllers.operator')
    .controller('InvalidCtrl',
    ['$scope', 'tplVars', 'postal',
      function ($scope, tplVars, postal) {
        // template vars
        tplVars = angular.extend({
          'title': 'Missing information'
        }, tplVars);
        $scope.tplVars = tplVars;

        // track which data hasn't been entered
        if (tplVars.errors) {
          angular.forEach(tplVars.errors, function (value) {
            postal.publish({
              channel: 'ConfirmationModal',
              topic: 'error',
              data: {
                label: value.message
              }
            });
          });
        }
        if (tplVars.warnings) {
          angular.forEach(tplVars.warnings, function (value) {
            postal.publish({
              channel: 'ConfirmationModal',
              topic: 'warning',
              data: {
                label: value.message
              }
            });
          });
        }

        $scope.close = function () {
          $scope.$dismiss('cancel');
        };

        $scope.proceed = function() {
          $scope.$close(true);
        };
      }
    ]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.provider').
    controller('AcceptRejectCaseCtrl', ['$scope', '$uibModal', 'flash', 'postal', '$state', function($scope, $uibModal, flash, postal, $state){
      $scope.showDebtReferralButton = function() {
        if (!$scope.case.provider_accepted || $scope.case.provider_closed) {
          return false;
        }

        return $scope.diagnosis.category === 'debt';
      };

      $scope.accept = function() {
        this.case.$accept_case().then(function(data) {
          flash('Case accepted successfully');
          // refreshing the logs
          postal.publish({
            channel : 'models',
            topic   : 'Log.refresh'
          });
          $scope.case = data;
        });
      };

      $scope.reject = function() {
        var modalOpts = {
          templateUrl: 'case_detail.outcome_modal.html',
          controller: 'OutcomesModalCtl',
          resolve: {
            tplVars: function() {
              return {
                title: 'Reject case'
              };
            },
            case: function() { return $scope.case; },
            eod_details: function() {return null;},
            Complaint: function() {return null;},
            event_key: function() { return 'reject_case'; },  //this is also the function name on Case model
            notes: function() { return null; },
            outcome_codes: ['Event', function (Event) {
              return new Event().list_by_event_key('reject_case').then(function (response) {
                return response.data;
              });
            }]
          }
        };
        var onSuccess = function (result) {
          if (result) {
            flash('success', 'Case ' + $scope.case.reference + ' rejected successfully');
          } else {
            flash('error', 'There was a problem rejecting this case');
          }
          $state.go('case_list');
        };

        $uibModal.open(modalOpts).result.then(onSuccess);
      };

      $scope.reopen = function() {
        var modalOpts = {
          templateUrl: 'case_detail.outcome_modal.html',
          controller: 'OutcomesModalCtl',
          resolve: {
            tplVars: function() {
              return {
                title: 'Reopen case'
              };
            },
            case: function() { return $scope.case; },
            eod_details: function() {return null;},
            Complaint: function() {return null;},
            event_key: function() { return 'reopen_case'; },
            notes: function() { return null; },
            outcome_codes: function() { return null; }
          }
        };
        var onSuccess = function (result) {
          if (result) {
            flash('Case re-opened successfully');
            postal.publish({
              channel : 'models',
              topic   : 'Log.refresh'
            });
            $scope.case = result;
          } else {
            flash('error', 'There was a problem re-opening this case');
          }
        };

        $uibModal.open(modalOpts).result.then(onSuccess);
      };

      $scope.split = function() {
        $uibModal.open({
          templateUrl: 'provider/case_detail.split.html',
          controller: 'SplitCaseCtrl',
          resolve: {
            case: function() { return $scope.case; },
            diagnosis: function() { return $scope.diagnosis; },
            provider_category: ['Category', function(Category) {
              return Category.get({code: $scope.diagnosis.category}).$promise;
            }],
            categories: ['Category', function(Category) {
              return Category.query().$promise;
            }]
          }
        });
      };
    }]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('CaseDetailCloseCtrl',
      ['$scope', '$state', 'flash', '$uibModal', '$uibModal',
        function($scope, $state, flash, $uibModal){
          var case_ref = $scope.case.reference;

          $scope.close = function() {
            this.case.$close_case().then(function() {
              $state.go('case_list');
              flash('success', 'Case '+case_ref+' closed successfully.');
            });
          };

          $scope.closeAsDREFER = function() {
            var modalOpts = {
              templateUrl: 'case_detail.outcome_modal.html',
              controller: 'OutcomesModalCtl',
              resolve: {
                tplVars: function() {
                  return {
                    title: 'Debt Referral'
                  };
                },
                case: function() { return $scope.case; },
                eod_details: function() {return null;},
                Complaint: function() {return null;},
                event_key: function() { return 'close_case_debt_referral'; },
                notes: function() { return null; },
                outcome_codes: function() { return null; }
              }
            };
            var onSuccess = function (result) {
              if (result) {
                $state.go('case_list');
                flash('success', 'Case '+case_ref+' closed successfully.');
              } else {
                flash('error', 'There was a problem re-opening this case');
              }
            };

            $uibModal.open(modalOpts).result.then(onSuccess);
          };
        }
      ]
    );
})();

(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('FeedbackListCtrl',
    ['$scope', '$uibModal', 'feedbackList', 'FEEDBACK_ISSUE', '_', 'Feedback',
      function ($scope, $uibModal, feedbackList, FEEDBACK_ISSUE, _, Feedback) {
        $scope.feedbackList = feedbackList;
        $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
        $scope.getFormattedFeedback = function(val) {
          return _.find(FEEDBACK_ISSUE, {value:  val});
        };

        $scope.submit = function () {
          var feedback_resource = new Feedback(angular.extend({
            case: $scope.case.reference
          }, $scope.newFeedback));
          return feedback_resource.$save().then(function () {
            Feedback.query({case: $scope.case.reference}).$promise.then(function (val) {
              $scope.feedbackList = val;
              $scope.newFeedback = {};
            });
          });
        };
      }
    ]
  );
})();

(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('SplitCaseCtrl',
    ['$scope', '$uibModalInstance', 'case', 'diagnosis', 'provider_category', 'MatterType', 'categories', '$state', 'flash', 'form_utils', 'postal',
      function ($scope, $uibModalInstance, case_, diagnosis, provider_category, MatterType, categories, $state, flash, form_utils, postal) {
        $scope.case = case_;
        $scope.diagnosis = diagnosis;
        $scope.categories = categories;
        $scope.provider_category = provider_category;
        $scope.matterTypes = null;

        $scope.$watch('category', function(newVal) {
          if (newVal) {
            $scope.matterType1 = null;
            $scope.matterType2 = null;
            $scope.matterTypes = MatterType.get({
              category__code: newVal
            });
          }
        });

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.doSplit = function(form) {
          $scope.submitted = true;

          if (form.$valid || $scope.responded) {
            $scope.case.split_case({
              category: $scope.category,
              matter_type1: $scope.matterType1,
              matter_type2: $scope.matterType2,
              notes: $scope.notes,
              internal: $scope.internal
            }).then(function() {
              flash('Case split successfully');
              $uibModalInstance.dismiss();

              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
            }, function(data) {
              $scope.responded = true;
              form_utils.ctrlFormErrorCallback($scope, data, form);
            });
          }
        };
      }
    ]
  );
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailDeferAssignment = {
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

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailAssign = {
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
        CanAssign: ['AssignProviderValidation', '$q', 'diagnosis', 'eligibility_check', 'case', 'personal_details', 'adaptation_details', 'History', function (AssignProviderValidation, $q, diagnosis, eligibility_check, $case, personal_details, adaptation_details, History) {
          var deferred = $q.defer();
          var valid = AssignProviderValidation.validate({case: $case, personal_details: personal_details, adaptation_details: adaptation_details});

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
              goto: previousState.name ? previousState.name : 'case_detail.edit.diagnosis'
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

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEditDiversity = {
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

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEdit.views['@case_detail'].templateUrl = 'call_centre/case_detail.edit.html';

    mod.states = states;
  });
})();

(function() {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailEODDetails = {
      parent: 'case_detail',
      name: 'case_detail.eod_details',
      url: 'eod-details/',
      onEnter: ['$stateParams', '$state', '$uibModal', 'case', 'eod_details', 'History', 'flash',
        function($stateParams, $state, $uibModal, $case, eod_details, History, flash) {

          var previousState = History.previousState;

          var onConfirmSuccess = function(result) {
            if (result) {
              flash('success', 'Expressions of dissatisfaction for case ' + $case.reference + ' saved successfully');
            } else {
              flash('error', 'Expressions of dissatisfaction not saved');
            }

            // $state.go('case_list');

            var state = previousState.name ? previousState.name : 'case_detail.edit.diagnosis';
            $state.go(state, {caseref: $case.reference});
          };

          var onDismiss = function(nextState) {
            if(nextState) {
              $state.go(nextState.state, nextState.params);
            } else {
              var state = previousState.name ? previousState.name : 'case_detail.edit.diagnosis';
              $state.go(state, {caseref: $case.reference});
            }
          };

          $uibModal.open({
            templateUrl: 'call_centre/case_detail.eod_details_modal.html',
            controller: 'EODDetailsModalCtrl',
            resolve: {
              case: function() {
                return $case;
              },
              eod_details: function() {
                return eod_details;
              }
            }
          }).result.then(onConfirmSuccess, onDismiss);
        }
      ]
    };

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetail.views[''].templateUrl = 'call_centre/case_detail.html';

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseDetailSuspend = {
      parent: 'case_detail',
      name: 'case_detail.suspend',
      url: 'suspend/',
      onEnter: ['$stateParams', '$state', '$uibModal', 'case', 'eod_details', 'personal_details', 'History', 'flash', 'postal', 'user',
        function($stateParams, $state, $uibModal, $case, eod_details, personal_details, History, flash, postal, user) {
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
              eod_details: function() {return eod_details;},
              event_key: function() { return 'suspend_case'; }, // this is also the function name on Case model
              notes: function () { return null; },
              outcome_codes: ['Event', function (Event) {
                return new Event().list_by_event_key('suspend_case').then(function (response) {
                  //Exclude operator_manager specific codes for non-manager users
                  return _.reject(response.data, function(item) {
                    return !user.is_manager && _.contains(['MRNB', 'MRCC'], item.code);
                  });
                });
              }]
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
            var state = previousState.name ? previousState.name : 'case_detail.edit.diagnosis';
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
            $uibModal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
          };

          // check personal details before suspending
          if (!personal_details.full_name || (!personal_details.postcode && !personal_details.mobile_phone)) {
            postal.publish({
              channel: 'ConfirmationModal',
              topic: 'warning',
              data: {
                label: 'Suspend case data'
              }
            });
            $uibModal.open(confirmOpts).result.then(onConfirmSuccess, onDismiss);
          } else {
            $uibModal.open(suspendOpts).result.then(onSuspendSuccess, onDismiss);
          }
        }
      ]
    };

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.Callbacks = {
      name: 'case_list.callbacks',
      parent: 'case_list',
      url: 'callbacks/',
      resolve: {
        cases: ['$stateParams', 'Case', function ($stateParams, Case){
          return Case.query_future_callbacks().$promise;
        }]
      },
      views: {
        'list-content@case_list': {
          templateUrl: 'call_centre/case_list.callbacks.html',
          controller: 'CallbacksCtrl'
        }
      }
    };

    mod.states = states;
  });
})();

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

(function() {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function(AppSettings) {
    var states = mod.states || angular.module('cla.states').states,
      complaintSubscriptions = [];

    states.ComplaintsList = {
      name: 'complaints_list',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'complaints/?page&ordering&show_closed&search',
      templateUrl: 'call_centre/complaints_list.html',
      controller: 'ComplaintsListCtrl',
      resolve: {
        complaintConstants: ['ComplaintConstants', function(ComplaintConstants) {
          return ComplaintConstants.get().$promise;
        }],
        complaintsList: ['user', '$q', '$stateParams', 'Complaint', function(user, $q, $stateParams, Complaint) {
          var deferred = $q.defer();
          if (!user.is_manager) {
            deferred.reject({
              msg: 'You must be a manager to view complaints.'
            });
            return deferred.promise;
          }

          var params = {
            dashboard: 'True',
            page: $stateParams.page,
            ordering: $stateParams.ordering,
            search: $stateParams.search
          };
          if($stateParams.show_closed === 'True') {
            params.show_closed = 'True';
          }

          return Complaint.query(params).$promise;
        }]
      }
    };

    states.Complaint = {
      name: 'complaint',
      parent: 'layout',
      url: AppSettings.BASE_URL + 'complaint/{complaint_id}/',
      templateUrl: 'call_centre/complaint.html',
      controller: 'ComplaintCtrl',
      resolve: {
        managers: ['User', function(User) {
          return User.query({is_manager: 'True'}).$promise;
        }],
        complaintCategories: ['ComplaintCategory', function(ComplaintCategory) {
          return ComplaintCategory.query().$promise;
        }],
        complaintConstants: ['ComplaintConstants', function(ComplaintConstants) {
          return ComplaintConstants.get().$promise;
        }],
        complaint: ['user', '$q', '$stateParams', 'Complaint', function(user, $q, $stateParams, Complaint) {
          var deferred = $q.defer();
          if (!user.is_manager) {
            deferred.reject({
              msg: 'You must be a manager to view complaints.'
            });
            return deferred.promise;
          }

          return Complaint.get({
            complaint_id: $stateParams.complaint_id
          }).$promise;
        }],
        complaintCase: ['complaint', 'Case', function(complaint, Case) {
          return Case.get({caseref: complaint.case_reference}).$promise;
        }],
        personal_details: ['complaintCase', 'PersonalDetails', function(complaintCase, PersonalDetails) {
          if(complaintCase.personal_details) {
            return PersonalDetails.get({case_reference: complaintCase.reference}).$promise;
          } else {
            return new PersonalDetails({case_reference: complaintCase.reference});
          }
        }],
        complaintLogs: ['complaint', function(complaint) {
          return complaint.$getLogs();
        }]
      },
      onEnter: ['postal', 'complaintLogs', function(postal, complaintLogs) {
        var callback = function() {
          complaintLogs.$refresh();
        };
        complaintSubscriptions.push(
          postal.subscribe({
            channel: 'Complaint',
            topic: 'save',
            callback: callback
          })
        );
        complaintSubscriptions.push(
          postal.subscribe({
            channel: 'models',
            topic: 'Log.refresh',
            callback: callback
          })
        );
      }],
      onExit: function() {
        angular.forEach(complaintSubscriptions, function(subscription) {
          subscription.unsubscribe();
        });
        complaintSubscriptions = [];
      }
    };

    mod.states = states;
  }]);
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.CsvDownload = {
      name: 'csv_download_list',
      parent: 'layout',
      templateUrl: 'csv_download_list.html',
      controller: 'CSVUploadCtrl',
      url: AppSettings.BASE_URL + 'csvdownload/?provider?page',
      resolve: {
        providers: ['Provider', function(Provider) {
          return Provider.query({}).$promise;
        }],
        csvuploads: ['$stateParams', 'CSVUpload', 'user', '$q',
          function ($stateParams, CSVUpload, user, $q) {
            var deferred = $q.defer();

            if (!user.is_manager) {
              // reject promise and handle in $stateChangeError
              deferred.reject({
                msg: 'You must be a manager to download these files.'
              });
            }

            var params = {
              page: $stateParams.page,
              provider_id: $stateParams.provider
            };
            return CSVUpload.query(params).$promise;
          }]
      }
    };

    mod.states = states;
  }]);
})();

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

(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.UserList.templateUrl = 'call_centre/user_list.html';

    mod.states = states;
  });
})();

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

(function () {
  'use strict';

  var mod = angular.module('cla.states.provider');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.CaseList.templateUrl = 'provider/case_list.html';

    mod.states = states;
  });
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.provider');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.CsvUpload = {
      name: 'csv_upload_list',
      parent: 'layout',
      templateUrl: 'csv_upload_list.html',
      controller: 'CSVUploadCtrl',
      url: AppSettings.BASE_URL + 'csvupload/?page',
      resolve: {
        providers: [function() {
          return [];
        }],
        csvuploads: ['$stateParams', 'CSVUpload',
          function ($stateParams, CSVUpload) {
            var params = {
              page: $stateParams.page
            };
            return CSVUpload.query(params).$promise;
          }
        ]
      }
    };

    mod.states = states;
  }]);
})();

(function () {
  'use strict';

  var mod = angular.module('cla.states.provider');

  mod.config(function () {
    var states = mod.states || angular.module('cla.states').states;

    states.UserList.templateUrl = 'provider/user_list.html';

    mod.states = states;
  });
})();

angular.module("cla.constants", [])

.constant("EXPRESSIONS_OF_DISSATISFACTION_FLAGS", {
	"incorrect": [
		"minor",
		"major"
	],
	"scope_assessment": [
		"major"
	],
	"adaptations": [
		"minor"
	],
	"means": [
		"minor"
	],
	"discrimination": [
		"major"
	],
	"pass_to_public": [
		"major"
	],
	"plo_referral": [
		"major"
	],
	"operator_attitude": [
		"major"
	],
	"advisor_attitude": [
		"major"
	],
	"alt_help": [
		"minor"
	],
	"data_protection": [
		"major"
	],
	"advisor_response": [
		"minor",
		"major"
	],
	"means_assessment": [
		"major"
	],
	"public_tool": [
		"minor"
	],
	"scope": [
		"minor"
	],
	"other": [
		"minor"
	],
	"operator_delay": [
		"minor",
		"major"
	],
	"delete": [
		"minor"
	]
})

.constant("ETHNICITIES", [
	{
		"text": "Prefer not to say",
		"group": null,
		"value": "Prefer not to say"
	},
	{
		"text": "Client Not Asked",
		"group": null,
		"value": "Client Not Asked"
	},
	{
		"text": "White: British",
		"group": "WHITE",
		"value": "White British"
	},
	{
		"text": "White: Irish",
		"group": "WHITE",
		"value": "White Irish"
	},
	{
		"text": "Black or Black British: Caribbean",
		"group": "BLACK",
		"value": "Black or Black British Caribbean"
	},
	{
		"text": "Black or Black British: African",
		"group": "BLACK",
		"value": "Black or Black British African"
	},
	{
		"text": "Black or Black British: Other",
		"group": "BLACK",
		"value": "Black or Black British Other"
	},
	{
		"text": "Asian or Asian British: Indian",
		"group": "ASIAN",
		"value": "Asian or Asian British Indian"
	},
	{
		"text": "Asian or Asian British: Pakistani",
		"group": "ASIAN",
		"value": "Asian or Asian British Pakistani"
	},
	{
		"text": "Asian or Asian British: Bangladeshi",
		"group": "ASIAN",
		"value": "Asian or Asian British Bangladeshi"
	},
	{
		"text": "Asian or Asian British: Other",
		"group": "ASIAN",
		"value": "Asian or Asian British Other"
	},
	{
		"text": "Chinese",
		"group": null,
		"value": "Chinese"
	},
	{
		"text": "Mixed: White and Black Caribbean",
		"group": "MIXED",
		"value": "Mixed White and Black Caribbean"
	},
	{
		"text": "Mixed: White and Black African",
		"group": "MIXED",
		"value": "Mixed White and Black African"
	},
	{
		"text": "Mixed: White and Asian",
		"group": "MIXED",
		"value": "Mixed White and Asian"
	},
	{
		"text": "Mixed: Other",
		"group": "MIXED",
		"value": "Mixed Other"
	},
	{
		"text": "Gypsy/Traveller",
		"group": null,
		"value": "Gypsy/Traveller"
	},
	{
		"text": "Other",
		"group": null,
		"value": "Other"
	}
])

.constant("SEXUAL_ORIENTATIONS", [
	{
		"text": "Prefer Not To Say",
		"value": "Prefer Not To Say"
	},
	{
		"text": "Heterosexual",
		"value": "Heterosexual"
	},
	{
		"text": "Gay man",
		"value": "Gay man"
	},
	{
		"text": "Gay woman",
		"value": "Gay woman"
	},
	{
		"text": "Bisexual",
		"value": "Bisexual"
	},
	{
		"text": "Other",
		"value": "Other"
	}
])

.constant("RELIGIONS", [
	{
		"text": "Prefer not to say",
		"value": "Prefer not to say"
	},
	{
		"text": "Christian",
		"value": "Christian"
	},
	{
		"text": "Muslim",
		"value": "Muslim"
	},
	{
		"text": "Hindu",
		"value": "Hindu"
	},
	{
		"text": "Sikh",
		"value": "Sikh"
	},
	{
		"text": "Jewish",
		"value": "Jewish"
	},
	{
		"text": "Buddhist",
		"value": "Buddhist"
	},
	{
		"text": "No religion",
		"value": "No religion"
	},
	{
		"text": "other ",
		"value": "other "
	}
])

.constant("GENDERS", [
	{
		"text": "Prefer not to say",
		"value": "Prefer not to say"
	},
	{
		"text": "Male",
		"value": "Male"
	},
	{
		"text": "Female",
		"value": "Female"
	}
])

.constant("FEEDBACK_ISSUE", [
	{
		"text": "Advisor conduct",
		"value": "ADCO"
	},
	{
		"text": "Access problems",
		"value": "ACPR"
	},
	{
		"text": "Already receiving/received advice",
		"value": "ARRA"
	},
	{
		"text": "Category of law is incorrect",
		"value": "COLI"
	},
	{
		"text": "Delay in advising (lack of follow up information)",
		"value": "DLAY"
	},
	{
		"text": "Delay in advising (other)",
		"value": "DLAO"
	},
	{
		"text": "Incorrect eligibility calculation",
		"value": "INEL"
	},
	{
		"text": "Incorrect diagnosis (out of scope)",
		"value": "INDI"
	},
	{
		"text": "Incorrect information provided (diagnosis)",
		"value": "INIP"
	},
	{
		"text": "Incorrect transferring of calls (provider)",
		"value": "INTC"
	},
	{
		"text": "Incorrect transferring of calls (front/back)",
		"value": "INFB"
	},
	{
		"text": "Incorrect/missing contact details or DOB",
		"value": "IMCD"
	},
	{
		"text": "Other data entry errors",
		"value": "ODDE"
	},
	{
		"text": "System Error",
		"value": "SESE"
	},
	{
		"text": "Other",
		"value": "OTHR"
	}
])

.constant("STATIC_ROOT", "/static/")

.constant("CASE_SOURCE", [
	{
		"text": "Phone",
		"value": "PHONE"
	},
	{
		"text": "Voicemail",
		"value": "VOICEMAIL"
	},
	{
		"text": "Sms",
		"value": "SMS"
	},
	{
		"text": "Web",
		"value": "WEB"
	}
])

.constant("DISABILITIES", [
	{
		"text": "Prefer not to say",
		"value": "PNS - Prefer not to say"
	},
	{
		"text": "Not Considered Disabled",
		"value": "NCD - Not Considered Disabled"
	},
	{
		"text": "Mobility impairment",
		"value": "MOB - Mobility impairment"
	},
	{
		"text": "Hearing impaired",
		"value": "HEA - Hearing impaired"
	},
	{
		"text": "Deaf",
		"value": "DEA - Deaf"
	},
	{
		"text": "Visually impaired",
		"value": "VIS - Visually impaired"
	},
	{
		"text": "Blind",
		"value": "BLI - Blind"
	},
	{
		"text": "Learning Disability/Difficulty",
		"value": "LDD - Learning Disability/Difficulty"
	},
	{
		"text": "Mental Health Condition",
		"value": "MHC - Mental Health Condition"
	},
	{
		"text": "Long-Standing Illness Or Health Condition",
		"value": "ILL - Long-Standing Illness Or Health Condition"
	},
	{
		"text": "Unknown",
		"value": "UKN - Unknown"
	},
	{
		"text": "Other",
		"value": "OTH - Other"
	}
])

.constant("ECF_STATEMENT", [
	{
		"text": "\"On closing this call you will hear a recorded message which will contain information to highlight limited circumstances in which legal aid may still be available to you. Thank you [client name] for calling Civil Legal Advice. Goodbye\"",
		"key": "XFER_TO_RECORDED_MESSAGE",
		"label": "Transferring inbound call to recorded message? Read out the following statement:"
	},
	{
		"text": "\"Legal aid may be available in exceptional circumstances to people whose cases are out of scope where a refusal to fund would breach Human Rights or enforceable European law. You could seek advice from a legal advisor about whether an application might succeed in your case and how to make one. Thank you for calling Civil Legal Advice. Goodbye\"",
		"key": "READ_OUT_MESSAGE",
		"label": "Outbound call? Read out the following statement:"
	},
	{
		"text": "",
		"key": "PROBLEM_NOT_SUITABLE",
		"label": "Problem not suitable for ECF message"
	},
	{
		"text": "",
		"key": "CLIENT_TERMINATED",
		"label": "Could not provide - client terminated call"
	}
])

.constant("THIRDPARTY_RELATIONSHIP", [
	{
		"text": "Parent or guardian",
		"value": "PARENT_GUARDIAN"
	},
	{
		"text": "Family member or friend",
		"value": "FAMILY_FRIEND"
	},
	{
		"text": "Professional",
		"value": "PROFESSIONAL"
	},
	{
		"text": "Legal adviser",
		"value": "LEGAL_ADVISOR"
	},
	{
		"text": "Other",
		"value": "OTHER"
	}
])

.constant("CONTACT_SAFETY", {
	"SAFE": "SAFE",
	"DONT_CALL": "DONT_CALL",
	"NO_MESSAGE": "NO_MESSAGE"
})

.constant("ADAPTATION_LANGUAGES", [
	{
		"text": "Assamese",
		"value": "ASSAMESE"
	},
	{
		"text": "Azeri",
		"value": "AZERI"
	},
	{
		"text": "Afrikaans",
		"value": "AFRIKAANS"
	},
	{
		"text": "Algerian",
		"value": "ALGERIAN"
	},
	{
		"text": "Ashanti",
		"value": "ASHANTI"
	},
	{
		"text": "Akan",
		"value": "AKAN"
	},
	{
		"text": "Albanian",
		"value": "ALBANIAN"
	},
	{
		"text": "Amharic",
		"value": "AMHARIC"
	},
	{
		"text": "Armenian",
		"value": "ARMENIAN"
	},
	{
		"text": "Arabic",
		"value": "ARABIC"
	},
	{
		"text": "Assyrian",
		"value": "ASSYRIAN"
	},
	{
		"text": "Azerbaijani",
		"value": "AZERBAIJANI"
	},
	{
		"text": "Badini",
		"value": "BADINI"
	},
	{
		"text": "Bengali",
		"value": "BENGALI"
	},
	{
		"text": "Burmese",
		"value": "BURMESE"
	},
	{
		"text": "Bajuni",
		"value": "BAJUNI"
	},
	{
		"text": "Belorussian",
		"value": "BELORUSSIAN"
	},
	{
		"text": "Bosnian",
		"value": "BOSNIAN"
	},
	{
		"text": "Berber",
		"value": "BERBER"
	},
	{
		"text": "Basque",
		"value": "BASQUE"
	},
	{
		"text": "Bulgarian",
		"value": "BULGARIAN"
	},
	{
		"text": "Brava",
		"value": "BRAVA"
	},
	{
		"text": "Brazilian",
		"value": "BRAZILIAN"
	},
	{
		"text": "Cantonese",
		"value": "CANTONESE"
	},
	{
		"text": "Cebuano",
		"value": "CEBUANO"
	},
	{
		"text": "Creole",
		"value": "CREOLE"
	},
	{
		"text": "Chinese",
		"value": "CHINESE"
	},
	{
		"text": "Cherokee",
		"value": "CHEROKEE"
	},
	{
		"text": "Columbian",
		"value": "COLUMBIAN"
	},
	{
		"text": "Cambodian",
		"value": "CAMBODIAN"
	},
	{
		"text": "Chaochow",
		"value": "CHAOCHOW"
	},
	{
		"text": "Croatian",
		"value": "CROATIAN"
	},
	{
		"text": "Catalan",
		"value": "CATALAN"
	},
	{
		"text": "Czech",
		"value": "CZECH"
	},
	{
		"text": "Danish",
		"value": "DANISH"
	},
	{
		"text": "Dari",
		"value": "DARI"
	},
	{
		"text": "Dutch",
		"value": "DUTCH"
	},
	{
		"text": "Egyptian",
		"value": "EGYPTIAN"
	},
	{
		"text": "English",
		"value": "ENGLISH"
	},
	{
		"text": "Estonian",
		"value": "ESTONIAN"
	},
	{
		"text": "Eritrean",
		"value": "ERITREAN"
	},
	{
		"text": "Esperanto",
		"value": "ESPERANTO"
	},
	{
		"text": "Ethiopian",
		"value": "ETHIOPIAN"
	},
	{
		"text": "Farsi",
		"value": "FARSI"
	},
	{
		"text": "Fijian",
		"value": "FIJIAN"
	},
	{
		"text": "Flemish",
		"value": "FLEMISH"
	},
	{
		"text": "Fanti",
		"value": "FANTI"
	},
	{
		"text": "French",
		"value": "FRENCH"
	},
	{
		"text": "Finnish",
		"value": "FINNISH"
	},
	{
		"text": "Fulla",
		"value": "FULLA"
	},
	{
		"text": "Ga",
		"value": "GA"
	},
	{
		"text": "German",
		"value": "GERMAN"
	},
	{
		"text": "Gurmukhi",
		"value": "GURMUKHI"
	},
	{
		"text": "Gaelic",
		"value": "GAELIC"
	},
	{
		"text": "Gorani",
		"value": "GORANI"
	},
	{
		"text": "Georgian",
		"value": "GEORGIAN"
	},
	{
		"text": "Greek",
		"value": "GREEK"
	},
	{
		"text": "Gujarati",
		"value": "GUJARATI"
	},
	{
		"text": "Hakka",
		"value": "HAKKA"
	},
	{
		"text": "Hebrew",
		"value": "HEBREW"
	},
	{
		"text": "Hindi",
		"value": "HINDI"
	},
	{
		"text": "Homa",
		"value": "HOMA"
	},
	{
		"text": "Hausa",
		"value": "HAUSA"
	},
	{
		"text": "Hungarian",
		"value": "HUNGARIAN"
	},
	{
		"text": "Hui",
		"value": "HUI"
	},
	{
		"text": "Icelandic",
		"value": "ICELANDIC"
	},
	{
		"text": "Igbo",
		"value": "IGBO"
	},
	{
		"text": "Ilocano",
		"value": "ILOCANO"
	},
	{
		"text": "Indonesian",
		"value": "INDONESIAN"
	},
	{
		"text": "Iraqi",
		"value": "IRAQI"
	},
	{
		"text": "Iranian",
		"value": "IRANIAN"
	},
	{
		"text": "Italian",
		"value": "ITALIAN"
	},
	{
		"text": "Japanese",
		"value": "JAPANESE"
	},
	{
		"text": "Kashmiri",
		"value": "KASHMIRI"
	},
	{
		"text": "Kreo",
		"value": "KREO"
	},
	{
		"text": "Kirundi",
		"value": "KIRUNDI"
	},
	{
		"text": "Kurmanji",
		"value": "KURMANJI"
	},
	{
		"text": "Kannada",
		"value": "KANNADA"
	},
	{
		"text": "Korean",
		"value": "KOREAN"
	},
	{
		"text": "Krio",
		"value": "KRIO"
	},
	{
		"text": "Kosovan",
		"value": "KOSOVAN"
	},
	{
		"text": "Kurdish",
		"value": "KURDISH"
	},
	{
		"text": "Kinyarwanda",
		"value": "KINYARWANDA"
	},
	{
		"text": "Kinyamirenge",
		"value": "KINYAMIRENGE"
	},
	{
		"text": "Kazakh",
		"value": "KAZAKH"
	},
	{
		"text": "Latvian",
		"value": "LATVIAN"
	},
	{
		"text": "Laotian",
		"value": "LAOTIAN"
	},
	{
		"text": "Lao",
		"value": "LAO"
	},
	{
		"text": "Lubwisi",
		"value": "LUBWISI"
	},
	{
		"text": "Lebanese",
		"value": "LEBANESE"
	},
	{
		"text": "Lingala",
		"value": "LINGALA"
	},
	{
		"text": "Luo",
		"value": "LUO"
	},
	{
		"text": "Lusoga",
		"value": "LUSOGA"
	},
	{
		"text": "Lithuanian",
		"value": "LITHUANIAN"
	},
	{
		"text": "Luganda",
		"value": "LUGANDA"
	},
	{
		"text": "Mandarin",
		"value": "MANDARIN"
	},
	{
		"text": "Macedonian",
		"value": "MACEDONIAN"
	},
	{
		"text": "Moldovan",
		"value": "MOLDOVAN"
	},
	{
		"text": "Mirpuri",
		"value": "MIRPURI"
	},
	{
		"text": "Mandinka",
		"value": "MANDINKA"
	},
	{
		"text": "Malay",
		"value": "MALAY"
	},
	{
		"text": "Mongolian",
		"value": "MONGOLIAN"
	},
	{
		"text": "Moroccan",
		"value": "MOROCCAN"
	},
	{
		"text": "Marathi",
		"value": "MARATHI"
	},
	{
		"text": "Maltese",
		"value": "MALTESE"
	},
	{
		"text": "Malayalam",
		"value": "MALAYALAM"
	},
	{
		"text": "Ndebele",
		"value": "NDEBELE"
	},
	{
		"text": "Nepalese",
		"value": "NEPALESE"
	},
	{
		"text": "Nigerian",
		"value": "NIGERIAN"
	},
	{
		"text": "Norwegian",
		"value": "NORWEGIAN"
	},
	{
		"text": "Nyakuse",
		"value": "NYAKUSE"
	},
	{
		"text": "Oromo",
		"value": "OROMO"
	},
	{
		"text": "Other",
		"value": "OTHER"
	},
	{
		"text": "Pahari",
		"value": "PAHARI"
	},
	{
		"text": "Persian",
		"value": "PERSIAN"
	},
	{
		"text": "Portuguese",
		"value": "PORTUGUESE"
	},
	{
		"text": "Philipino",
		"value": "PHILIPINO"
	},
	{
		"text": "Polish",
		"value": "POLISH"
	},
	{
		"text": "Pothwari",
		"value": "POTHWARI"
	},
	{
		"text": "Pusthu",
		"value": "PUSTHU"
	},
	{
		"text": "Punjabi",
		"value": "PUNJABI"
	},
	{
		"text": "Romanian",
		"value": "ROMANIAN"
	},
	{
		"text": "Russian",
		"value": "RUSSIAN"
	},
	{
		"text": "Sotho",
		"value": "SOTHO"
	},
	{
		"text": "Serbo-Croat",
		"value": "SERBO-CROAT"
	},
	{
		"text": "Swedish",
		"value": "SWEDISH"
	},
	{
		"text": "Serbian",
		"value": "SERBIAN"
	},
	{
		"text": "Shona",
		"value": "SHONA"
	},
	{
		"text": "Sinhalese",
		"value": "SINHALESE"
	},
	{
		"text": "Siraiki",
		"value": "SIRAIKI"
	},
	{
		"text": "Slovak",
		"value": "SLOVAK"
	},
	{
		"text": "Samoan",
		"value": "SAMOAN"
	},
	{
		"text": "Slovenian",
		"value": "SLOVENIAN"
	},
	{
		"text": "Somali",
		"value": "SOMALI"
	},
	{
		"text": "Sorani",
		"value": "SORANI"
	},
	{
		"text": "Spanish",
		"value": "SPANISH"
	},
	{
		"text": "Sri Lankan",
		"value": "SRI LANKAN"
	},
	{
		"text": "Scottish Gaelic",
		"value": "SCOTTISH GAELIC"
	},
	{
		"text": "Sudanese",
		"value": "SUDANESE"
	},
	{
		"text": "Swahili",
		"value": "SWAHILI"
	},
	{
		"text": "Swahilli",
		"value": "SWAHILLI"
	},
	{
		"text": "Sylheti",
		"value": "SYLHETI"
	},
	{
		"text": "Tamil",
		"value": "TAMIL"
	},
	{
		"text": "Tibetan",
		"value": "TIBETAN"
	},
	{
		"text": "Telegu",
		"value": "TELEGU"
	},
	{
		"text": "Elakil",
		"value": "ELAKIL"
	},
	{
		"text": "Tagalog",
		"value": "TAGALOG"
	},
	{
		"text": "Thai",
		"value": "THAI"
	},
	{
		"text": "Tigrinian",
		"value": "TIGRINIAN"
	},
	{
		"text": "Tigre",
		"value": "TIGRE"
	},
	{
		"text": "Tajik",
		"value": "TAJIK"
	},
	{
		"text": "Taiwanese",
		"value": "TAIWANESE"
	},
	{
		"text": "Turkmanish",
		"value": "TURKMANISH"
	},
	{
		"text": "Tswana",
		"value": "TSWANA"
	},
	{
		"text": "Turkish",
		"value": "TURKISH"
	},
	{
		"text": "Twi",
		"value": "TWI"
	},
	{
		"text": "Ugandan",
		"value": "UGANDAN"
	},
	{
		"text": "Ukranian",
		"value": "UKRANIAN"
	},
	{
		"text": "Urdu",
		"value": "URDU"
	},
	{
		"text": "Ussian",
		"value": "USSIAN"
	},
	{
		"text": "Uzbek",
		"value": "UZBEK"
	},
	{
		"text": "Vietnamese",
		"value": "VIETNAMESE"
	},
	{
		"text": "Welsh",
		"value": "WELSH"
	},
	{
		"text": "Wolof",
		"value": "WOLOF"
	},
	{
		"text": "Xhosa",
		"value": "XHOSA"
	},
	{
		"text": "Yugoslavian",
		"value": "YUGOSLAVIAN"
	},
	{
		"text": "Yiddish",
		"value": "YIDDISH"
	},
	{
		"text": "Yoruba",
		"value": "YORUBA"
	},
	{
		"text": "Zulu",
		"value": "ZULU"
	}
])

.constant("THIRDPARTY_REASON", [
	{
		"text": "Child or patient",
		"value": "CHILD_PATIENT"
	},
	{
		"text": "Subject to power of attorney",
		"value": "POWER_ATTORNEY"
	},
	{
		"text": "Cannot communicate via the telephone, due to disability",
		"value": "NO_TELEPHONE_DISABILITY"
	},
	{
		"text": "Cannot communicate via the telephone, due to a language requirement",
		"value": "NO_TELEPHONE_LANGUAGE"
	},
	{
		"text": "Other",
		"value": "OTHER"
	}
])

.constant("TITLES", [
	{
		"text": "Mr",
		"value": "mr"
	},
	{
		"text": "Mrs",
		"value": "mrs"
	},
	{
		"text": "Miss",
		"value": "miss"
	},
	{
		"text": "Ms",
		"value": "ms"
	},
	{
		"text": "Dr",
		"value": "dr"
	}
])

.constant("SPECIFIC_BENEFITS", [
	{
		"text": "Universal credit",
		"value": "universal_credit"
	},
	{
		"text": "Income Support",
		"value": "income_support"
	},
	{
		"text": "Income-based Job Seekers Allowance",
		"value": "job_seekers_allowance"
	},
	{
		"text": "Guarantee State Pension Credit",
		"value": "pension_credit"
	},
	{
		"text": "Income-related Employment and Support Allowance",
		"value": "employment_support"
	}
])

.constant("RESEARCH_CONTACT_VIA", [
	{
		"text": "Email",
		"value": "EMAIL"
	},
	{
		"text": "Phone",
		"value": "PHONE"
	},
	{
		"text": "Sms",
		"value": "SMS"
	}
])

.constant("DIAGNOSIS_SCOPE", {
	"INELIGIBLE": "INELIGIBLE",
	"UNKNOWN": "UNKNOWN",
	"MEDIATION": "MEDIATION",
	"OUTOFSCOPE": "OUTOFSCOPE",
	"INSCOPE": "INSCOPE",
	"CONTACT": "CONTACT"
})

.constant("EXEMPT_USER_REASON", [
	{
		"text": "Client is a child",
		"value": "ECHI"
	},
	{
		"text": "Client is in detention",
		"value": "EDET"
	},
	{
		"text": "12 month exemption",
		"value": "EPRE"
	}
])

.constant("REQUIRES_ACTION_BY", {
	"OPERATOR": "operator",
	"OPERATOR_MANAGER": "operator_manager",
	"PROVIDER_REVIEW": "1_provider_review",
	"PROVIDER": "2_provider"
})

.constant("ELIGIBILITY_STATES", {
	"UNKNOWN": "unknown",
	"YES": "yes",
	"NO": "no"
})

.constant("EXPRESSIONS_OF_DISSATISFACTION", [
	{
		"text": "Believes operator has given incorrect information",
		"value": "incorrect"
	},
	{
		"text": "Unhappy with Operator Service determination (Scope)",
		"value": "scope"
	},
	{
		"text": "Unhappy with Operator Service determination (Means)",
		"value": "means"
	},
	{
		"text": "Wants personal details deleted",
		"value": "delete"
	},
	{
		"text": "No response from specialist advisor, or response delayed",
		"value": "advisor_response"
	},
	{
		"text": "Operator service - delay in advice",
		"value": "operator_delay"
	},
	{
		"text": "Unhappy with operator's attitude",
		"value": "operator_attitude"
	},
	{
		"text": "Unhappy with specialist's attitude",
		"value": "advisor_attitude"
	},
	{
		"text": "Alternative help not appropriate or not available",
		"value": "alt_help"
	},
	{
		"text": "Unhappy with online service",
		"value": "public_tool"
	},
	{
		"text": "Problems with adaptations or adjustments",
		"value": "adaptations"
	},
	{
		"text": "Scope reassessment requested",
		"value": "scope_assessment"
	},
	{
		"text": "Financial reassessment requested",
		"value": "means_assessment"
	},
	{
		"text": "Threatens to pass the matter on to the media, or other public or regulatory body",
		"value": "pass_to_public"
	},
	{
		"text": "Breach of Data Protection Act/policy and confidentiality",
		"value": "data_protection"
	},
	{
		"text": "Discrimination from an operator or specialist",
		"value": "discrimination"
	},
	{
		"text": "Client unhappy with PLO referral",
		"value": "plo_referral"
	},
	{
		"text": "Other",
		"value": "other"
	}
])

;
(function () {
  'use strict';

  var readonlyElements = document.getElementsByClassName('js-remove-readonly-onfocus');

  for (var i = 0; i < readonlyElements.length; i += 1) {
    readonlyElements[i].onfocus = function () {
      this.removeAttribute('readonly');
    };
  }
})();
