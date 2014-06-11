'use strict';

/* jasmine specs for controllers go here */
describe('OperatorApp controllers', function() {

  beforeEach(module('cla.app'));

  describe('CaseListCtrl', function(){
    it('should init with cases empty if there are no cases', inject(function($controller) {
      var scope = {},
          ctrl = $controller('CaseListCtrl', {$scope:scope, cases:[]});

      expect(scope.cases.length).toBe(0);
    }));
  });
});
