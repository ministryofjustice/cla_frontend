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
