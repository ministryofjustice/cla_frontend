(function(){
  'use strict';
  
  var saveDelay = 750;

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl',
      ['$scope', '$timeout', 'form_utils', 'AlternativeHelpService',
        function($scope, $timeout, form_utils, AlternativeHelpService){
          var timeout = null,
          watchChange = function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (timeout) {
                $timeout.cancel(timeout);
              }
              timeout = $timeout($scope.save, saveDelay);
            }
          };


          // when viewing coming back to the details view
          // clear out the Alternative Help selections.
          AlternativeHelpService.clear();

          $scope.save = function(){
            $scope.case.$case_details_patch(
              angular.noop,
              angular.bind(this, form_utils.ctrlFormErrorCallback, $scope)
            );
          };

          // watch fields
          $scope.$watch('case.notes', watchChange);
          $scope.$watch('case.provider_notes', watchChange);
        }
      ]
    );
})();