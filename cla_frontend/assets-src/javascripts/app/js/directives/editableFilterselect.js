(function () {
  'use strict';

  angular.module('xeditable').directive('editableFilterselect', [
    'editableDirectiveFactory',
    'editableNgOptionsParser',
    function (editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableFilterselect',
        inputTpl: '<select ui-select2="{allowClear: true}"><option value=""></option></select>',
        useCopy: true
      });
    }
  ]);
})();
