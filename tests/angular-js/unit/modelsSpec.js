'use strict';

describe('EligibilityCheck model', function() {

  beforeEach(module('cla.operatorApp'));

  var EligibilityCheck;

  beforeEach(inject(function (_EligibilityCheck_) {
    EligibilityCheck = _EligibilityCheck_;
  }));

  describe('hasSMOD', function () {
    it('is true for family category', function () {
      var ec = new EligibilityCheck({category: 'family'});
      expect(ec.hasSMOD()).toBe(true);
    });

    it('is true for debt category', function () {
      var ec = new EligibilityCheck({category: 'debt'});
      expect(ec.hasSMOD()).toBe(true);
    });

    it('is false for any other category', function () {
      var ec = new EligibilityCheck({category: 'clinneg'});
      expect(ec.hasSMOD()).toBe(false);
    });

    it('is false when category is not set', function () {
      var ec = new EligibilityCheck();
      expect(ec.hasSMOD()).toBe(false);
    });
  });

  describe('resetDisputedSavings', function () {
    it('zeroes out all disputed_savings fields', function () {
      var ec = new EligibilityCheck({
        category: 'family',
        disputed_savings: {
          bank_balance: 100,
          investment_balance: 200,
          asset_balance: 300,
          credit_balance: 400
        }
      });

      ec.resetDisputedSavings();

      expect(ec.disputed_savings).toEqual({
        bank_balance: 0,
        investment_balance: 0,
        asset_balance: 0,
        credit_balance: 0
      });
    });
  });

  describe('resetDisputedProperties', function () {
    it('marks every property as not disputed without changing other fields', function () {
      var ec = new EligibilityCheck({
        property_set: [
          {value: 100000, disputed: '1', main: true},
          {value: 200000, disputed: 1, main: false}
        ]
      });

      ec.resetDisputedProperties();

      expect(ec.property_set).toEqual([
        {value: 100000, disputed: 0, main: true},
        {value: 200000, disputed: 0, main: false}
      ]);
    });

    it('handles an unset property_set', function () {
      var ec = new EligibilityCheck();

      expect(function () {
        ec.resetDisputedProperties();
      }).not.toThrow();
    });
  });
});
