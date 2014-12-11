(function () {
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  var caseRef;
  var notices = element(by.css('.NoticeContainer--fixed'));
  var diversityTab = element(by.cssContainingText('.Tabs-tabLink', 'Diversity'));
  var sectionTitle = element(by.css('.FormBlock-label'));
  var summary = element(by.css('.SummaryBlock'));
  var nextBtn = element(by.name('diversity-next'));
  var backBtn = element(by.name('diversity-back'));
  var saveBtn = element(by.name('diversity-save'));

  describe('diversityMonitoring', function () {
    beforeEach(utils.setUp);

    describe('Operator diversity monitoring', function () {
      it('should not allow access without personal details object', function () {
        modelsRecipe.Case.createEmpty().then(function (_caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + '/');
          element(by.css('[ui-sref="case_detail.diversity"]')).click();
          expect(notices.getText()).toContain('You must add the client\'s details before completing the diversity questionnaire.');
        });
      });

      it('should show diversity questions if incomplete', function () {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function (_caseRef) {
          caseRef = _caseRef;
          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + '/');
          element(by.css('[ui-sref="case_detail.diversity"]')).click();
          expect(sectionTitle.getText()).toBe('Gender');
        });
      });

      it('should complete gender questions', function () {
        chooseOption('gender', 'Male');
        utils.scrollTo(nextBtn);
        nextBtn.click();
        utils.scrollTo(summary);
        expect(summary.getText()).toContain('Gender: Male');
      });

      it('should complete ethnicity questions', function () {
        chooseOption('ethnicity', 'Chinese');
        utils.scrollTo(nextBtn);
        nextBtn.click();
        utils.scrollTo(summary);
        expect(summary.getText()).toContain('Ethnic origin: Chinese');
      });

      it('should be able to navigate back', function () {
        utils.scrollTo(backBtn);
        backBtn.click();
        utils.scrollTo(sectionTitle);
        expect(sectionTitle.getText()).toBe('Ethnic origin');
        assertOption('ethnicity', 'Chinese');

        utils.scrollTo(backBtn);
        backBtn.click();
        utils.scrollTo(sectionTitle);
        expect(sectionTitle.getText()).toBe('Gender');
        assertOption('gender', 'Male');
      });

      it('should be able to navigate forwards', function () {
        utils.scrollTo(nextBtn);
        nextBtn.click();
        utils.scrollTo(sectionTitle);
        expect(sectionTitle.getText()).toBe('Ethnic origin');
        assertOption('ethnicity', 'Chinese');

        utils.scrollTo(nextBtn);
        nextBtn.click();
        utils.scrollTo(sectionTitle);
        expect(sectionTitle.getText()).toBe('Disabilities');
      });

      it('should complete disability questions', function () {
        chooseOption('disability', 'BLI - Blind');
        utils.scrollTo(nextBtn);
        nextBtn.click();
        utils.scrollTo(summary);
        expect(summary.getText()).toContain('Blind');
      });

      it('should complete religion questions', function () {
        chooseOption('religion', 'Christian');
        utils.scrollTo(nextBtn);
        nextBtn.click();
        utils.scrollTo(summary);
        expect(summary.getText()).toContain('Religion / belief: Christian');
      });

      it('should complete sexual_orientation questions', function () {
        chooseOption('sexual_orientation', 'Bisexual');
        utils.scrollTo(saveBtn);
        saveBtn.click();
        utils.scrollTo(summary);
        expect(summary.getText()).toContain('The client has completed diversity monitoring.');
        expect(diversityTab.getAttribute('class')).toContain('Icon--solidTick Icon--green');
      });

      it('should have saved and no longer display answers', function () {
        browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/diversity/');
        expect(summary.getText()).toContain('The client has completed diversity monitoring.');
        expect(diversityTab.getAttribute('class')).toContain('Icon--solidTick Icon--green');
      });
    });
  });

  // helpers
  function chooseOption (name, value) {
    var field = element(by.css('[type="radio"][name="' + name + '"][value="' + value + '"]'));

    utils.scrollTo(field);
    field.click();
  }

  function assertOption (name, value) {
    var el = element(by.css('[type="radio"][name="' + name + '"][value="' + value + '"]'));
    utils.scrollTo(el);
    expect(el.getAttribute('checked')).toBeTruthy();
  }
})();
