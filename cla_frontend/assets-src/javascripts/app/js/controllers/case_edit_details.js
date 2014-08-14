(function(){
  'use strict';
  
  // var saveDelay = 800;

  angular.module('cla.controllers')
    .controller('CaseEditDetailCtrl',
      ['$scope', 'AlternativeHelpService',
        function($scope, AlternativeHelpService){
          // when viewing coming back to the details view
          // clear out the Alternative Help selections.
          AlternativeHelpService.clear();
        }
      ]
    );

  angular.module('cla.controllers')
    .controller('CaseNotesCtrl',
      ['$scope', '$timeout', 'form_utils', 'flash',
        function($scope, $timeout, form_utils, flash){
          // var timeout = null,
          //     saveInProgress = false,
          //     saveFinished = function() {
          //       saveInProgress = false;
          //     },
          //     watchChange = function(newVal, oldVal) {
          //       if (newVal !== oldVal) {
          //         if (timeout) {
          //           $timeout.cancel(timeout);
          //         }
          //         timeout = $timeout($scope.save, saveDelay);
          //       }
          //     };

          // $scope.save = function(){
          //   if ($scope.caseFrm.$valid) {
          //     saveInProgress = true;
          //     $scope.case.$case_details_patch(
          //       function() {
          //         flash('success', 'Case notes successfully saved.');
          //       },
          //       function(response){
          //         form_utils.ctrlFormErrorCallback($scope, response, $scope.caseFrm);
          //       }
          //     ).finally(saveFinished);
          //   }
          // };

          // // watch fields
          // $scope.$watch('case.notes', watchChange);
          // $scope.$watch('case.provider_notes', watchChange);
        }
      ]
    );
})();