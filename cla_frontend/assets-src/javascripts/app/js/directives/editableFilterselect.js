(function(){
  'use strict';

  angular.module('xeditable').directive('editableFilterselect', [
    'editableDirectiveFactory',
    'editableNgOptionsParser',
    function(editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableFilterselect',
        inputTpl: '<select ui-select2><option value=""></option></select>',
        useCopy: true
      });
  }]);

  angular.module('xeditable').directive('editableMultiselect', [
    'editableDirectiveFactory',
    'editableNgOptionsParser',
    function(editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableMultiselect',
        inputTpl: '<select ui-select2 multiple><option value=""></option></select>',
        useCopy: true
      });
  }]);
})();