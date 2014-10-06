(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CallMeBackCtrl',
      ['$scope', '$modal',
        function($scope, $modal){
          $scope.callMeBack = function() {
            $modal.open({
              templateUrl: 'call_centre/case_detail.callmeback_modal.html',
              controller: 'CallMeBackModalCtrl',
              resolve: {
                'case': function() { return $scope.case; }
              }
            });
          };
        }
      ]
    );


  angular.module('cla.controllers')
    .controller('CallMeBackModalCtrl',
      ['$scope', '$modalInstance', 'case',
        'Event', '$state', 'flash', 'moment', 'form_utils',
        function($scope, $modalInstance, _case,
                 Event, $state, flash, moment, form_utils) {

          // default datetime to now
          $scope.datetime = new Date(new Date().getTime() + 15*60000);

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.submit = function(form) {
            var dt = moment(this.datetime).utc().format('YYYY-MM-DD HH:mm');
            _case.$call_me_back({
              'datetime': dt,
              'notes': this.notes || ''
            }).then(function() {
              $state.go('case_list');
              flash('success', 'Callback scheduled successfully.');
              $modalInstance.dismiss('cancel');
            }, function(data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            });
          };

        }
      ]
    );

})();
