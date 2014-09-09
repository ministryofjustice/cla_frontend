(function(){
  'use strict';

  angular.module('cla.controllers.provider')
    .controller('CaseDetailCloseCtrl',
      ['$scope', '$state', 'flash',
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

  angular.module('cla.controllers.provider')
    .controller('OutcomesModalCtlWithFeedback',
    ['$scope', '$modalInstance', 'case', 'event_key',
      'success_msg', 'Event', '$state', 'flash',
      'notes', 'tplVars', '$controller', 'FEEDBACK_ISSUE', '$q', 'Feedback',
      function ($scope, $modalInstance, _case, event_key, success_msg,
                Event, $state, flash, notes, tplVars, $controller, FEEDBACK_ISSUE, $q, Feedback) {
        angular.extend(this, $controller('OutcomesModalCtl', {
          $scope: $scope,
          $modalInstance: $modalInstance,
          case: _case,
          event_key: event_key,
          success_msg: success_msg,
          Event: Event,
          $state: $state,
          flash: flash,
          notes: notes,
          tplVars: tplVars
        }));
        $scope.FEEDBACK_ISSUE = FEEDBACK_ISSUE;
        $scope.leaveFeedback = false;
        $scope.feedback = {case: _case.reference};

        $scope.submit_feedback = function (comment) {
          var feedback_resource = new Feedback(angular.extend($scope.feedback, {comment: comment}));
          return feedback_resource.$save();
        };


        $scope.submit = function () {
          var that = this,
          feedback_promise = $scope.leaveFeedback ? $scope.submit_feedback(that.notes) : $q.when(true);
          feedback_promise.then(function () {
              return $scope.submit_outcome(that.event_code, that.notes);
            }).then($scope.post_submit);
        };

      }]);

  angular.module('cla.controllers')
    .controller('SplitCaseCtrl',
    ['$scope', '$modalInstance', 'case', 'diagnosis', 'MatterType', 'categories', '$state', 'flash',
      function ($scope, $modalInstance, case_, diagnosis, MatterType, categories, $state, flash) {
        $scope.case = case_;
        $scope.diagnosis = diagnosis;
        $scope.categories = categories;
        $scope.matterTypes = null;

        $scope.$watch('category', function(newVal) {
          if (newVal) {
            $scope.matterTypes = MatterType.get({
              category__code: newVal
            });
          }
        });

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.save = function() {
          console.log([
            'Category: '+$scope.category,
            'Matter Type 1: '+$scope.matterType1,
            'Matter Type 2: '+$scope.matterType2,
            'Assignment: '+$scope.assignment
          ].join('\n'));

          $scope.case.split_case({
            category: $scope.category,
            matter_type1: $scope.matterType1,
            matter_type2: $scope.matterType2,
            internal: $scope.assignment === 'internal'
          }).then(function() {
            flash('Case split successfully');
            $modalInstance.dismiss();
          });
        };
        // $scope.matter_types = matter_types;

        // $scope.cancel = function () {
        //   $modalInstance.dismiss('cancel');
        //   $scope.case.matter_type1 = null;
        //   $scope.case.matter_type2 = null;
        // };

        // $scope.save = function() {
        //   $scope.case.$set_matter_types().then(function () {
        //     $modalInstance.close();
        //     if ($scope.next) {
        //       $state.go($scope.next);
        //     }
        //   });
        // };
      }
    ]
  );

  angular.module('cla.controllers.provider').
    controller('AcceptRejectCaseCtrl', ['$scope', '$modal', 'flash', function($scope, $modal, flash){
      $scope.accept = function() {
        this.case.$accept_case().then(function(data) {
          flash('Case accepted successfully.');
          $scope.case = data;
        });
      };

      $scope.reject = function() {
        $modal.open({
          templateUrl: 'case_detail.outcome_modal.with_feedback.html',
          controller: 'OutcomesModalCtlWithFeedback',
          resolve: {
            'tplVars': function() {
              return {
                title: 'Reject Case'
              };
            },
            'case': function() { return $scope.case; },
            'event_key': function() { return 'reject_case'; },  //this is also the function name on Case model
            'notes': function() { return ''; },
            'success_msg': function() { return 'Case '+$scope.case.reference+' rejected successfully'; }
          }
        });
      };

      $scope.split = function() {
        $modal.open({
          templateUrl: 'provider/case_detail.split.html',
          controller: 'SplitCaseCtrl',
          resolve: {
            // 'tplVars': function() {
            //   return {
            //     title: 'Split Case'
            //   };
            // },
            'case': function() { return $scope.case; },
            'diagnosis': function() { return $scope.diagnosis; },
            // 'event_key': function() { return 'reject_case'; },  //this is also the function name on Case model
            // 'notes': function() { return ''; },
            // 'success_msg': function() { return 'Case '+$scope.case.reference+' rejected successfully'; }
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
