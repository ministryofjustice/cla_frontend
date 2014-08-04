'use strict';
(function(){



  angular.module('cla.directives')
  .directive('threePartDateInput', function() {
    return  {
      restrict: 'E',
      require: 'ngModel',
      templateUrl:  'directives/three_part_date_input.html',
      scope: {
        model: '=ngModel'
      },
      link: function(scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$setViewValue(scope.model);
      }
    };
  });


  angular.module('xeditable').directive('editableTpde', ['editableDirectiveFactory',
    function(editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableTpde',
        inputTpl: '<three-part-date-input></three-part-date-input>',
        useCopy: true
      });
    }]);

})();
