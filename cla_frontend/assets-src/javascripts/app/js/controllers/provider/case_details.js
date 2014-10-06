(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('CaseDetailCloseCtrl',
      ['$scope', '$state', 'flash', '$modal',
        function($scope, $state, flash){
          var case_ref = $scope.case.reference;

          $scope.close = function() {
            this.case.$close_case().then(function() {
              $state.go('case_list');
              flash('success', 'Case '+case_ref+' closed successfully.');
            });
          };
        }
      ]
    );



  angular.module('cla.controllers')
    .controller('SplitCaseCtrl',
    ['$scope', '$modalInstance', 'case', 'diagnosis', 'provider_category', 'MatterType', 'categories', '$state', 'flash', 'form_utils', 'postal',
      function ($scope, $modalInstance, case_, diagnosis, provider_category, MatterType, categories, $state, flash, form_utils, postal) {
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
          $modalInstance.dismiss('cancel');
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
              $modalInstance.dismiss();

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

  angular.module('cla.controllers.provider').
    controller('AcceptRejectCaseCtrl', ['$scope', '$modal', 'flash', 'postal', '$state', function($scope, $modal, flash, postal, $state){
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
    }]);


  angular.module('cla.controllers.provider')
    .controller('FeedbackListCtrl',
    ['$scope', '$modal', 'feedbackList', 'FEEDBACK_ISSUE', '_', 'Feedback',
      function ($scope, $modal, feedbackList, FEEDBACK_ISSUE, _, Feedback) {
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
