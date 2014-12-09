(function () {
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      CONSTANTS = require('../protractor.constants');

  var zeroIncomeNotice = element(by.cssContainingText('.Notice', 'The system is showing me that:'));
  var saveBtn = element(by.cssContainingText('button', 'Save assessment'));
  var passportedBenefits = element(by.name('your_details-passported_benefits'));
  var specificBenefits = element(by.name('your_details-specific_benefits-universal_credit'));

  describe('meansTest', function () {
    beforeEach(utils.setUp);

    describe('Operator financial assessment', function () {
      it('cases without specific benefits get grouped question', function () {
        modelsRecipe.Case.createWithGroupedBenefits().then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/eligibility/details/');

          expect(passportedBenefits.isPresent()).toBe(true);
          expect(specificBenefits.isPresent()).toBe(false);
        });
      });

      it('should display all 4 sections', function () {
        assertTabsShown(4);
      });

      it('should not show income or expenses tabs if on passported benefits', function () {
        setPassported(true);
        assertTabsShown(2);
        expect(getTab('Income', 2).isPresent()).toBe(false);
        expect(getTab('Expenses', 2).isPresent()).toBe(false);
      });

      it('should show income and expenses if change to on passported benefits', function () {
        setPassported(false);
        assertTabsShown(4);
        expect(getTab('Income', 2).isPresent()).toBe(true);
        expect(getTab('Expenses', 2).isPresent()).toBe(true);
      });

      it('specific benefits should be listed', function () {
        modelsRecipe.Case.createEmptyWithInScopeAndEligible().then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/eligibility/details/');

          expect(passportedBenefits.isPresent()).toBe(false);
          expect(specificBenefits.isPresent()).toBe(true);
        });
      });

      it('should display all 4 sections', function () {
        assertTabsShown(4);
      });

      it('should not show income or expenses tabs if on passported benefits', function () {
        setSpecificBenefits(true);
        assertTabsShown(2);
        expect(getTab('Income', 2).isPresent()).toBe(false);
        expect(getTab('Expenses', 2).isPresent()).toBe(false);
      });

      it('should show income and expenses if change to on passported benefits', function () {
        setSpecificBenefits(false);
        assertTabsShown(4);
        expect(getTab('Income', 2).isPresent()).toBe(true);
        expect(getTab('Expenses', 2).isPresent()).toBe(true);
      });

      it('should not be allowed when not in scope', function () {
        modelsRecipe.Case.createWithScopeAndEligibility(false).then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');
          var tab = getTab('Finances');

          // check is disabled
          expect(tab.getAttribute('class')).toContain('is-disabled');
          tab.element(by.css('a')).click();
          // check not finances page
          expect(browser.getLocationAbsUrl()).not.toContain(caseRef + '/eligibility/');
          expect(browser.getLocationAbsUrl()).toContain(caseRef + '/diagnosis/');
        });
      });

      it('should be allowed when no/out of scope but has assessment', function () {
        modelsRecipe.Case.createRecipe({}, {}, {}, CONSTANTS.eligibility.true).then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/');
          var tab = getTab('Finances');

          // check is not disabled
          expect(tab.getAttribute('class')).not.toContain('is-disabled');
          tab.element(by.css('a')).click();

          expect(browser.getLocationAbsUrl()).toContain(caseRef + '/eligibility/');
        });
      });

      // income warnings
      it('new case should show no alerts', function () {
        modelsRecipe.Case.createWithScope(true).then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/eligibility/');
          expect(zeroIncomeNotice.isPresent()).toBe(false);
        });
      });

      it('should show all income alerts', function () {
        modelsRecipe.Case.createEmptyWithInScopeAndEligible().then(function (caseRef) {
          browser.get(CONSTANTS.callcentreBaseUrl + caseRef + '/eligibility/');

          setPartner(true);
          fillIncomeFields('Income', 'partner-income', '0');
          fillIncomeFields('Expenses', 'partner-expenses', '0');

          getToSection('Expenses');

          var mortgage = element(by.name('eligibility_check.you.deductions.mortgage'));
          mortgage.clear();
          mortgage.sendKeys(1);
          saveEC();

          expect(zeroIncomeNotice.isPresent()).toBe(true);
          expect(zeroIncomeNotice.getText()).toContain('you and your partner currently have no income');
          expect(zeroIncomeNotice.getText()).toContain('you and your partner currently have negative disposable income');
          expect(zeroIncomeNotice.getText()).toContain('your housing costs exceed one third of your income');
        });
      });

      it('show only show alerts when sections are complete', function () {
        var youTax = element(by.name('eligibility_check.you.deductions.income_tax'));
        var youBenefits = element(by.name('eligibility_check.you.income.benefits'));
        var partnerTax = element(by.name('eligibility_check.partner.deductions.income_tax'));
        var partnerBenefits = element(by.name('eligibility_check.partner.income.benefits'));

        getToSection('Expenses');
        youTax.clear();
        getToSection('Income');
        youBenefits.clear();
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(false);

        getToSection('Expenses');
        youTax.sendKeys(0);
        getToSection('Income');
        youBenefits.sendKeys(0);
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(true);

        getToSection('Expenses');
        partnerTax.clear();
        getToSection('Income');
        partnerBenefits.clear();
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(false);

        getToSection('Expenses');
        partnerTax.sendKeys(0);
        getToSection('Income');
        partnerBenefits.sendKeys(0);
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(true);
      });

      it('show no longer show zero and negative income alerts', function () {
        getToSection('Income');

        var earnings = element(by.name('eligibility_check.partner.income.earnings'));
        earnings.clear();
        earnings.sendKeys(2.99);
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(true);
        expect(zeroIncomeNotice.getText()).not.toContain('have no income');
        expect(zeroIncomeNotice.getText()).not.toContain('negative disposable income');
        expect(zeroIncomeNotice.getText()).toContain('your housing costs exceed one third of your income');
      });

      it('show no longer show housing alert', function () {
        var earnings = element(by.name('eligibility_check.partner.income.earnings'));
        earnings.clear();
        earnings.sendKeys(3);
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(false);
      });

      it('show show alerts again when no partner', function () {
        setPartner(false);
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(true);
        expect(zeroIncomeNotice.getText()).toContain('you currently have no income');
        expect(zeroIncomeNotice.getText()).toContain('you currently have negative disposable income');
        expect(zeroIncomeNotice.getText()).toContain('your housing costs exceed one third of your income');
      });

      it('show hide alerts when setting income', function () {
        getToSection('Income');

        var earnings = element(by.name('eligibility_check.you.income.earnings'));
        earnings.clear();
        earnings.sendKeys(3);
        saveEC();

        expect(zeroIncomeNotice.isPresent()).toBe(false);
      });
    });
  });

  // helpers
  function assertTabsShown (num) {
    element.all(by.css('ul [ng-repeat="section in sections"]')).then(function (tabs) {
      expect(tabs.length).toBe(num);
    });
  }

  function getTab (title, level) {
    var selector = level > 1 ? '.Pills-pill' : '.Tabs-tab';
    return element(by.cssContainingText(selector, title));
  }

  function getToSection (title) {
    var tab = getTab(title, 2);
    utils.scrollTo(tab); // firefox fix!
    return tab.element(by.css('a')).click();
  }

  function setPassported (value) {
    var detailsTab = getTab('Details', 2);
    var yes_no = value ? '0' : '1';
    utils.scrollTo(element(by.name('case.notes'))); // firefox fix!
    detailsTab.element(by.css('a')).click();
    element(by.id('id_your_details-passported_benefits_' + yes_no)).click();
  }

  function setSpecificBenefits (value) {
    element(by.css('[name="your_details-specific_benefits-universal_credit"][value="' + value + '"]')).click();
  }

  function setPartner (value) {
    var detailsTab = getTab('Details', 2);
    var yes_no = value ? '0' : '1';

    // click details tab
    utils.scrollTo(element(by.name('case.notes'))); // firefox fix!
    detailsTab.element(by.css('a')).click();
    element(by.id('id_your_details-has_partner_' + yes_no)).click();
  }

  function fillIncomeFields (section, fieldset, value) {
    var incomeTab = getTab(section, 2);

    // click income tab
    utils.scrollTo(incomeTab); // firefox fix!
    incomeTab.element(by.css('a')).click();

    // loop number fields and fill in
    element.all(by.css('[data-fieldset="' + fieldset + '"] input[type="number"]')).each(function(el) {
      el.clear();
      el.sendKeys(value);
    });
  }

  function saveEC () {
    utils.scrollTo(saveBtn);
    saveBtn.click();
  }
})();
