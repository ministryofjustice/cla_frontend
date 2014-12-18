(function(){
  'use strict';

  angular.module('cla.controllers.provider').
    controller('AcceptRejectCaseCtrl', ['$scope', '$modal', 'flash', 'postal', '$state', function($scope, $modal, flash, postal, $state){
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
          templateUrl: 'case_detail.outcome_modal.with_feedback.html',
          controller: 'OutcomesFeedbackModalCtl',
          resolve: {
            tplVars: function() {
              return {
                title: 'Reject case'
              };
            },
            case: function() { return $scope.case; },
            event_key: function() { return 'reject_case'; },  //this is also the function name on Case model
            notes: function() { return ''; }
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

        $modal.open(modalOpts).result.then(onSuccess);
      };

      $scope.reopen = function() {
        var modalOpts = {
          templateUrl: 'case_detail.outcome_modal.html',
          controller: 'ImplicitOutcomeModalCtl',
          resolve: {
            tplVars: function() {
              return {
                title: 'Reopen case'
              };
            },
            case: function() { return $scope.case; },
            model_action: function() { return 'reopen_case'; },
            notes: function() { return ''; }
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

        $modal.open(modalOpts).result.then(onSuccess);
      };

      $scope.split = function() {
        $modal.open({
          templateUrl: 'provider/case_detail.split.html',
          controller: 'SplitCaseCtrl',
          resolve: {
            'case': function() { return $scope.case; },
            'diagnosis': function() { return $scope.diagnosis; },
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
