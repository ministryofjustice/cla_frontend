(function(){
  'use strict';

  var saveDelay = 800;

  angular.module('cla.directives')
    .directive('notesForm', ['$timeout', 'form_utils', 'AppSettings', function($timeout, form_utils, AppSettings) {
      return  {
        restrict: 'E',
        require: 'ngModel',
        templateUrl:  'directives/notes_form.html',
        scope: {
          model: '=ngModel',
          ref: '@ngModel',
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
                angular.noop,
                function(response){
                  form_utils.ctrlFormErrorCallback(scope, response, scope.notesFrm);
                }
              ).finally(saveFinished);
            }
          };

          scope.type = AppSettings.appName === 'operator' ? 'operator' : 'cla_provider';

          // watch fields
          scope.$watch('model', watchChange);
        }
      };
    }]);

})();
