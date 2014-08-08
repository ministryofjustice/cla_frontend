(function(){
  'use strict';

  angular.module('xeditable').directive('editableFilterselect', [
    'editableDirectiveFactory',
    'editableNgOptionsParser',
    function(editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'editableFilterselect',
        inputTpl: '<select ui-select2 ng-model="model" data-placeholder="Pick a code"></select>',
        useCopy: true
      });
  }]);
})();