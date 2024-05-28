(function(){
  'use strict';

  angular.module('cla.controllers.provider').
    controller('AcceptRejectCaseCtrl', ['$scope', '$uibModal', 'flash', 'postal', '$state', '$window',
    function($scope, $uibModal, flash, postal, $state, $window){
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
          $window.dataLayer.push({ 'event': 'ProviderAcceptOrReject', 'AcceptOrReject': 'Accepted', 'MediaCode': data.media_code, 'MatterType1': data.matter_type1, 'MatterType2': data.matter_type2, 'OutcomeCode': data.outcome_code  });
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
            $window.dataLayer.push({ 'event': 'ProviderAcceptOrReject', 'AcceptOrReject': 'Rejected', 'MediaCode': $scope.case ? $scope.case.media_code : null, 'MatterType1': $scope.case ? $scope.case.matter_type1 : null, 'MatterType2': $scope.case ? $scope.case.matter_type2 : null, 'OutcomeCode': result.config ? result.config.data ? result.config.data.event_code : null : null  });
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
