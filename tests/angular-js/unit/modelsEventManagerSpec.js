'use strict';

describe('ModelsEventManager', function() {

  beforeEach(module('cla.operatorApp'));

  var ModelsEventManager, postal;

  beforeEach(inject(function (_ModelsEventManager_, _postal_) {
    ModelsEventManager = _ModelsEventManager_;
    postal = _postal_;
  }));

  var makeEligibilityCheck = function (category, hasSMOD) {
    return {
      category: category,
      reference: 'some-reference',
      hasSMOD: jasmine.createSpy('hasSMOD').and.returnValue(hasSMOD),
      resetDisputedSavings: jasmine.createSpy('resetDisputedSavings'),
      $update: jasmine.createSpy('$update')
    };
  };

  var publishDiagnosisSaved = function (diagnosis) {
    postal.publish({
      channel: 'models',
      topic: 'Diagnosis.saved',
      data: diagnosis
    });
  };

  it('resets disputed_savings when the new category does not have SMOD', function () {
    var case_ = {reference: 'case-ref'};
    var eligibility_check = makeEligibilityCheck(undefined, false);
    var diagnosis = {category: 'clinneg'};
    var manager = ModelsEventManager(case_, eligibility_check, diagnosis, []);

    manager.onEnter();
    publishDiagnosisSaved(diagnosis);

    expect(eligibility_check.category).toBe('clinneg');
    expect(eligibility_check.resetDisputedSavings).toHaveBeenCalled();
    expect(eligibility_check.$update).toHaveBeenCalledWith('case-ref');
  });

  it('does not reset disputed_savings when the new category has SMOD', function () {
    var case_ = {reference: 'case-ref'};
    var eligibility_check = makeEligibilityCheck(undefined, true);
    var diagnosis = {category: 'family'};
    var manager = ModelsEventManager(case_, eligibility_check, diagnosis, []);

    manager.onEnter();
    publishDiagnosisSaved(diagnosis);

    expect(eligibility_check.category).toBe('family');
    expect(eligibility_check.resetDisputedSavings).not.toHaveBeenCalled();
    expect(eligibility_check.$update).toHaveBeenCalledWith('case-ref');
  });


//  A case can have multiple scope diagnoses done, 
//  this tests that the  resetDisputedSavings method 
//  is not called for a different diagnosis instance
  it('ignores Diagnosis.saved events for a different diagnosis instance', function () {
    var case_ = {reference: 'case-ref'};
    var eligibility_check = makeEligibilityCheck(undefined, false);
    var diagnosis = {category: 'clinneg'};
    var manager = ModelsEventManager(case_, eligibility_check, diagnosis, []);

    manager.onEnter();
    publishDiagnosisSaved({category: 'clinneg'}); // different object identity

    expect(eligibility_check.category).toBeUndefined();
    expect(eligibility_check.resetDisputedSavings).not.toHaveBeenCalled();
    expect(eligibility_check.$update).not.toHaveBeenCalled();
  });
});
