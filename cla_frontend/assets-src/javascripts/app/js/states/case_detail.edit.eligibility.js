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

          var target = $("#wrapper")[0];

          var config = {
            childList: true,
            subtree: true
          };

          var callback = function(mutationsList, observer) {
            var pillsSectionList = document.getElementById("pills-section-list");
            if (pillsSectionList) {
              observer.disconnect()
              $(".Pills-pillLink").click(function(){
                var heightHeaderAndCaseBar = $(".CaseBar").height()*2*!$(".CaseBar.is-sticky").length + $("header").height();
                $([document.documentElement, document.body]).animate({
                  scrollTop: ($("#pills-section-list").offset().top - heightHeaderAndCaseBar)
                }, 0);
              });
            }
          }

          var observer = new MutationObserver(callback);

          observer.observe(target, config);

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
