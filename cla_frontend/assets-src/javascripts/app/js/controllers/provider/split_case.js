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
