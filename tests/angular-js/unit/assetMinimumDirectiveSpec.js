(function () {
  'use strict';

  describe('Asset minimum directive', function () {
    var scope, input;

    beforeEach(module('cla.directives'));

    beforeEach(inject(function ($rootScope, $compile) {
      scope = $rootScope.$new();
      scope.amount = 0;
      $compile('<form name="form"><input name="amount" type="number" min="0" max="9999999999" step="0.01" cla-pence-to-pounds asset-minimum ng-model="amount"></form>')(scope);
      scope.$digest();
      input = scope.form.amount;
    }));

    [
      {value: '0', valid: true, pence: 0},
      {value: '0.01', valid: false},
      {value: '499.99', valid: false},
      {value: '500', valid: true, pence: 2312},
      {value: '500.01', valid: true, pence: 50001},
      {value: '99999999.99', valid: true, pence: 9999999999},
      {value: '100000000', valid: false},
      {value: '-1', valid: false},
      {value: 'not a number', valid: false},
      {value: '', valid: true, pence: null}
    ].forEach(function (testCase) {
      it('validates the pounds input "' + testCase.value + '"', function () {
        input.$setViewValue(testCase.value);
        expect(input.$valid).toBe(testCase.valid);
        expect(scope.amount).toBe(testCase.valid ? testCase.pence : undefined);
      });
    });

    it('validates existing model values in pence', function () {
      scope.amount = 49999;
      scope.$digest();
      expect(input.$error.assetMinimum).toBe(true);

      scope.amount = 50000;
      scope.$digest();
      expect(input.$valid).toBe(true);
      expect(input.$viewValue).toBe('500');
    });

    it('clears the error when the amount is corrected', function () {
      input.$setViewValue('499.99');
      expect(input.$error.assetMinimum).toBe(true);

      input.$setViewValue('500');
      expect(input.$valid).toBe(true);
      expect(scope.amount).toBe(50000);
    });
  });
})();
