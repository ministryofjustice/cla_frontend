'use strict';

/* jasmine specs for controllers go here */
describe('OperatorApp controllers', function() {

  beforeEach(module('cla.app'));

  describe('CaseListCtrl', function(){

    it("contains spec with an expectation", function() {
      expect(true).toBe(true);
    });

    // it('should init with cases empty if there are no cases', inject(function($controller) {
    //   var scope = {},
    //       cases = [],
    //       ctrl = $controller('CaseListCtrl', {$scope: scope, cases:cases});

    //   expect(scope.cases.length).toBe(0);
    // }));

    // it('should show some cases', inject(function($controller) {
    //   var scope = {},
    //       cases = [
    //         { reference: 'a' },
    //         { reference: 'b' }
    //       ],
    //       ctrl = $controller('CaseListCtrl', {$scope: scope, cases:cases});

    //   expect(scope.cases.length).toBe(2);
    // }));

    // it('should keep track of the search param', inject(function($controller) {
    //   var scope = {},
    //       cases = [],
    //       ctrl;

    //   // no search => no search param
    //   ctrl = $controller('CaseListCtrl', {$scope: scope, cases: cases, $stateParams: { 'search': null }});
    //   expect(scope.search).toBe(null);

    //   // search defined => passing
    //   ctrl = $controller('CaseListCtrl', {$scope: scope, cases: cases, $stateParams: { 'search': 'a string' }});
    //   expect(scope.search).toBe('a string');
    // }));

    // it('should order and allow the user to change the ordering', inject(function($controller) {
    //   var scope = {},
    //       cases = [],
    //       ctrl;

    //   // default behaivour
    //   ctrl = $controller('CaseListCtrl', {$scope: scope, cases: cases});
    //   expect(scope.orderProp).toBe('-created');

    //   // ordering prop passed in via url param
    //   ctrl = $controller('CaseListCtrl', {$scope: scope, cases: cases, $stateParams: { 'sort': 'sorting_string' }});
    //   expect(scope.orderProp).toBe('sorting_string');

    //   // sort toggle
    //   ctrl = $controller('CaseListCtrl', {$scope: scope, cases: cases, $stateParams: { 'sort': 'sorting_string' }});
    //   expect(scope.sortToggle('sorting_string')).toBe('-sorting_string');

    //   ctrl = $controller('CaseListCtrl', {$scope: scope, cases: cases, $stateParams: { 'sort': '-sorting_string' }});
    //   expect(scope.sortToggle('sorting_string')).toBe('sorting_string');
    // }));
  });
});
