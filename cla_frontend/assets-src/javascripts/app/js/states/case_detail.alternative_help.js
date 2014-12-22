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

    mod.states = states;
  });
})();
