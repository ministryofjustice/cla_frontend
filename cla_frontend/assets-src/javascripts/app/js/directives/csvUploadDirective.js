(function(){
  'use strict';

  angular.module('cla.directives')
    .directive('csvUpload', ['Papa', function(Papa) {
      return {
        scope: {},
        link: function(scope, elements, attrs, ngModelCtrl) {
          elements.find('input').bind('change', function(evt){
            var elem = evt.target;
            scope.rows = [];
            scope.errors = [];
            ngModelCtrl.$setValidity('csvfile', true);

            Papa.parse(elem.files[0], {
              header: attrs.header || false,
              before: function () {
                elem.classList.add('csv-pending');
              },
              step: function (row, handle) {
                if (row.errors.length) {
                  scope.errors.push(row.errors[0]);
                  handle.abort();
                } else {
                  scope.rows.push(row.data[0]);
                }
              },
              complete: function () {
                if (!scope.errors.length) {
                  ngModelCtrl.$setViewValue(scope.rows);
                  elem.classList.remove('csv-pending');
                  elem.classList.add('csv-complete');
                  scope.rows = [];
                  scope.errors = [];
                  scope.global_error = null;
                } else {
                  ngModelCtrl.$setValidity('csvfile', false);
                }
                scope.$apply();
              },
              error: function(err, file, inputElem, reason) {
                scope.global_error = {err: err, reason: reason};
                scope.$apply();
                elem.classList.remove('csv-pending');
                elem.classList.add('csv-error');
              }
            });
          });
        },
        templateUrl: 'directives/csvUpload.html',
        restrict: 'E',
        require: '?ngModel'
      };
    }]);
})();
