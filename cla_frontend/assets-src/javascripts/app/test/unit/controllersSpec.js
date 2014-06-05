'use strict';

/* jasmine specs for controllers go here */
describe('OperatorApp controllers', function() {

  beforeEach(module('operatorApp'));

  describe('CaseListCtrl', function(){
    it('should init search param as empty', inject(function($controller) {
      var scope = {},
          ctrl = $controller('CaseListCtrl', {$scope:scope});

      expect(scope.search.length).toBe(0);
    }));
  });
});
