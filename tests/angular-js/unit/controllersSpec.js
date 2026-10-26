'use strict';

/* jasmine specs for controllers go here */
describe('OperatorApp controllers', function() {

  beforeEach(module('cla.operatorApp'));

  describe('CaseListCtrl', function(){

    it('contains spec with an expectation', function() {
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

  describe('EligibilityCheckCtrl', function () {
    var $httpBackend, $controller, $rootScope, scope, eligibility_check, flash, state;

    beforeEach(inject(function (_$httpBackend_, _$controller_, _$rootScope_) {
      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;

      // catch-all for the Category.query() call made on controller init
      $httpBackend.whenGET(/.*/).respond(200, []);

      scope = $rootScope.$new();
      eligibility_check = {
        you: {},
        partner: {},
        category: 'family',
        hasSMOD: jasmine.createSpy('hasSMOD').and.callFake(function () {
          return eligibility_check.category === 'family' || eligibility_check.category === 'debt';
        }),
        resetDisputedSavings: jasmine.createSpy('resetDisputedSavings'),
        resetDisputedProperties: jasmine.createSpy('resetDisputedProperties'),
        $update: jasmine.createSpy('$update')
      };
      scope.eligibility_check = eligibility_check;
      scope.case = {reference: 'test-case'};
      flash = jasmine.createSpy('flash');
      state = {go: jasmine.createSpy('go')};

      $controller('EligibilityCheckCtrl', {
        $scope: scope,
        flash: flash,
        $state: state,
        IncomeWarningsService: {
          setEligibilityCheck: jasmine.createSpy('setEligibilityCheck'),
          warnings: {}
        },
        diagnosis: {category: 'family', nodes: []}
      });
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('hasSMOD delegates to the eligibility_check model', function () {
      expect(scope.hasSMOD()).toBe(true);
      expect(eligibility_check.hasSMOD).toHaveBeenCalled();

      eligibility_check.category = 'clinneg';
      expect(scope.hasSMOD()).toBe(false);
    });

    it('save() resets disputed savings and properties before updating when SMOD does not apply', function () {
      eligibility_check.category = 'clinneg';

      scope.save();

      expect(eligibility_check.resetDisputedSavings).toHaveBeenCalled();
      expect(eligibility_check.resetDisputedProperties).toHaveBeenCalled();
      expect(eligibility_check.$update).toHaveBeenCalled();
    });

    it('save() does not reset disputed savings or properties when SMOD applies', function () {
      eligibility_check.category = 'family';

      scope.save();

      expect(eligibility_check.resetDisputedSavings).not.toHaveBeenCalled();
      expect(eligibility_check.resetDisputedProperties).not.toHaveBeenCalled();
      expect(eligibility_check.$update).toHaveBeenCalled();
    });

    it('does not save an invalid form and shows an error', function () {
      var form = {$invalid: true, $setSubmitted: jasmine.createSpy('$setSubmitted')};

      expect(scope.save(form)).toBe(false);

      expect(form.$setSubmitted).toHaveBeenCalled();
      expect(flash).toHaveBeenCalledWith('error', 'The WERE has not been saved. Correct the invalid fields before continuing.');
      expect(eligibility_check.$update).not.toHaveBeenCalled();
    });

    it('saves a valid form', function () {
      scope.save({$invalid: false});

      expect(eligibility_check.$update).toHaveBeenCalled();
    });

    it('keeps the current tab when auto-save encounters invalid input', function () {
      scope.formDidChange = true;
      var form = {$invalid: true, $setSubmitted: jasmine.createSpy('$setSubmitted')};

      scope.gotoSection({state: 'case_detail.edit.eligibility.income'}, form);

      expect(eligibility_check.$update).not.toHaveBeenCalled();
      expect(state.go).not.toHaveBeenCalled();
      expect(form.$setSubmitted).toHaveBeenCalled();
    });

    it('auto-saves valid changes before switching tabs', function () {
      scope.formDidChange = true;

      scope.gotoSection({state: 'case_detail.edit.eligibility.income'}, {$invalid: false});

      expect(eligibility_check.$update).toHaveBeenCalled();
      expect(state.go).toHaveBeenCalledWith('case_detail.edit.eligibility.income');
    });
  });
});
