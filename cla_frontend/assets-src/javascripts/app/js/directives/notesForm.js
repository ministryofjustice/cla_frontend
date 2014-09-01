(function(){
  'use strict';

  var saveDelay = 800;

  angular.module('cla.directives')
    .directive('notesForm', ['$timeout', 'form_utils', 'flash', function($timeout, form_utils, flash) {
      return  {
        restrict: 'E',
        require: 'ngModel',
        templateUrl:  'directives/notes_form.html',
        scope: {
          model: '=ngModel',
          case: '='
        },
        link: function(scope) {
          var timeout = null,
              saveInProgress = false,
              saveFinished = function() {
                saveInProgress = false;
              },
              watchChange = function(newVal, oldVal) {
                if (newVal !== oldVal) {
                  if (timeout) {
                    $timeout.cancel(timeout);
                  }
                  timeout = $timeout(scope.save, saveDelay);
                }
              };

          scope.save = function(){
            $timeout.cancel(timeout);
            
            if (scope.notesFrm.$valid && !saveInProgress) {
              saveInProgress = true;
              scope.case.$case_details_patch(
                function() {
                  flash('success', 'Case notes saved successfully');
                },
                function(response){
                  form_utils.ctrlFormErrorCallback(scope, response, scope.notesFrm);
                }
              ).finally(saveFinished);
            }
          };

          // watch fields
          scope.$watch('model', watchChange);
        }
      };
    }]);

})();
