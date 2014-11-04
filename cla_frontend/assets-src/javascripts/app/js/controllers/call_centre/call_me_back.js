(function(){
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('CallMeBackCtrl',
      ['$scope', '$modal', 'AppSettings',
        function($scope, $modal, AppSettings){
          $scope.callMeBackEnabled = AppSettings.callMeBackEnabled;

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

          $scope.case = _case;
          $scope.canBeCalledBack = _case.canBeCalledBack();
          $scope.createdByWeb = _case.createdByWeb();
          $scope.isFinalCallBack = _case.isFinalCallback();

          if ($scope.canBeCalledBack) {
            if (_case.isFinalCallback()) {
              $scope.title = 'Schedule final callback';
            } else if (_case.getCallbackDatetime()) {
              $scope.title = 'Schedule a new callback';
            } else {
              $scope.title = 'Schedule a callback';
            }
          } else {
            $scope.title = 'Cancel callback';
          }

          function formatDate(dt) {
            return moment(dt).format('DD/MM/YYYY HH:mm');
          }

          $scope.datePickerConf = {
            time: true,
            weekStart: 1,
            min: formatDate(new Date(new Date().getTime() + 31*60000)),  // starts from (now + 30 mins)
            inputFormat: 'DD/MM/YYYY HH:mm'
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.submit = function(form) {
            var dt = moment(this.datetime, 'DD/MM/YYYY HH:mm').utc();
            _case.$call_me_back({
              'datetime': formatDate(dt),
              'notes': this.notes || ''
            }).then(function() {
              $state.go('case_list');
              flash('success', 'Callback scheduled successfully.');
              $modalInstance.dismiss('cancel');
            }, function(data) {
              form_utils.ctrlFormErrorCallback($scope, data, form);
            });
          };

          $scope.cancelCallback = function() {
            _case.$cancel_call_me_back().then(function() {
              $state.go('case_list');
              flash('success', 'Callback cancelled successfully.');
              $modalInstance.dismiss('cancel');
            });
          };

        }
      ]
    );

})();
