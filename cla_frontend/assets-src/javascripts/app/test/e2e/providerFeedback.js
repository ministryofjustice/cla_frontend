(function () {
  'use strict';

  var utils = require('../e2e/_utils'),
      CONSTANTS = require('../protractor.constants.js'),
      modelsRecipe = require('./_modelsRecipe'),
      protractor = require('protractor'),
      ptor = protractor.getInstance();

  var case_to_reject_ref,
      case_to_feedback_without_reject_ref,
      reject_notes = 'this is feedback left with rejection',
      feedback_notes = 'this is plain feedback';

  describe('providerFeedback', function () {
    describe('An operator', function () {
      beforeEach(utils.setUp);

      it('should create a case as operator and assign (manually) to a provider', function () {
        modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
          case_to_reject_ref = case_ref;
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/assign/?as_of=2014-08-06T11:50');
          get_provider().then(function (provider) {
            if (provider !== 'Duncan Lewis') {
              utils.manuallySetProvider(1); // set to Duncan Lewis
            }
            do_assign();
            expect(browser.getLocationAbsUrl()).toBe(ptor.baseUrl + CONSTANTS.callcentreBaseUrl);
          });
        });
      });

      it('should create a case as operator and assign (manually) to a provider which wont be rejected', function () {
        modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
          case_to_feedback_without_reject_ref = case_ref;
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + '/assign/?as_of=2014-08-06T11:50');
          get_provider().then(function (provider) {
            if (provider !== 'Duncan Lewis') {
              utils.manuallySetProvider(1); // set to Duncan Lewis
            }
            do_assign();
            expect(browser.getLocationAbsUrl()).toBe(ptor.baseUrl + CONSTANTS.callcentreBaseUrl);
          });
        });
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });


    describe('A provider', function () {
      beforeEach(utils.setUpAsProvider);

      it('should have example case assigned & ready to reject', function () {
        // case is ready to be rejected/accepted.
        var reject_button = element(by.name('reject-case')),
            reject_code = element(by.css('.modal-content input[type="radio"][name="code"][value="COI"]')),
            mis_reject_code = element(by.css('.modal-content input[type="radio"][name="code"][value="MIS"]')),
            notes_area = element(by.css('.modal-content textarea[ng-model="::notes"]')),
            leave_feedback_btn = element(by.css('button[name="add-feedback"]')),
            feedback_issue_select = element(by.css('div#s2id_reject_feedback_issue a')),
            feedback_issue_select_options = element.all(by.css('li.select2-results-dept-0')),
            modal_submit = element(by.css('.modal-content button.Button[type="submit"]'));

        browser.get(CONSTANTS.providerBaseUrl + case_to_reject_ref + '/');

        //press reject and can see feedback
        expect(reject_button.isPresent()).toBe(true);
        reject_button.click();

        expect(reject_code.isDisplayed()).toBe(true);
        expect(mis_reject_code.isDisplayed()).toBe(true);
        reject_code.click();

        notes_area.sendKeys(reject_notes);

        expect(leave_feedback_btn.isDisplayed()).toBe(true);

        reject_code.click();
        expect(leave_feedback_btn.isDisplayed()).toBe(true);

        mis_reject_code.click();
        expect(leave_feedback_btn.isDisplayed()).toBe(false);
        // mis code forces feedback
        expect(feedback_issue_select.isDisplayed()).toBe(true);

        reject_code.click();
        expect(leave_feedback_btn.isDisplayed()).toBe(true);
        leave_feedback_btn.click();

        expect(feedback_issue_select.isDisplayed()).toBe(true);
        feedback_issue_select.click();

        expect(feedback_issue_select_options.count()).not.toBe(0);
        feedback_issue_select_options.then(function (li) {
          li[0].click();
        });

        expect(modal_submit.isDisplayed()).toBe(true);
        modal_submit.click();
      });

      it('should have example case assigned & ready to feedback without rejecting', function () {
        var leave_feedback_btn = element(by.css('button[name="leave-feedback"]')),
            reject_btn = element(by.css('button[name="reject-case"]')),
            feedback_form = element(by.name('inline-provider-feedback-frm')),
            feedback_issue_select = element(by.css('div#s2id_newFeedback_issue a')),
            feedback_issue_select_options = element.all(by.css('li.select2-results-dept-0')),
            notes_area = element(by.css('div[ui-view="feedback"] form  textarea[ng-model="::newFeedback.comment"]')),
            submit_button = element(by.css('button[name="save-feedback"]'));

        browser.get(CONSTANTS.providerBaseUrl + case_to_feedback_without_reject_ref + '/');

        expect(reject_btn.isPresent()).toBe(true);
        expect(feedback_form.isDisplayed()).toBe(false);

        leave_feedback_btn.click();

        expect(feedback_form.isDisplayed()).toBe(true);

        // select feedback reason
        feedback_issue_select.click();
        expect(feedback_issue_select_options.count()).not.toBe(0);
        feedback_issue_select_options.then(function (li) {
          li[0].click();
        });

        // enter notes
        notes_area.sendKeys(feedback_notes);

        // submit feedback
        utils.scrollToBottom(submit_button);
        submit_button.click();
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });


    describe('As Operator Manager', function () {
      beforeEach(utils.setUpAsOperatorManager);

      var case_rejected_with_feedback_link,
          case_not_rejected_with_feedback_link,
          checked_case,
          justify_btn,
          unjustify_btn,
          hide_resolved_btn,
          resolved_cases;

      it('feedback should be created for rejected case', function () {
        browser.get(CONSTANTS.callcentreBaseUrl + 'feedback/');

        case_rejected_with_feedback_link = element(by.css('input[value="' + case_to_reject_ref + '"]'));
        expect(case_rejected_with_feedback_link.isPresent()).toBe(true);
      });

      it('feedback should be created for non-rejected case', function () {
        case_not_rejected_with_feedback_link = element(by.css('input[value="' + case_to_feedback_without_reject_ref + '"]'));
        expect(case_not_rejected_with_feedback_link.isPresent()).toBe(true);
      });

      it('should be able to resolve case', function () {
        case_rejected_with_feedback_link.click();

        expect(case_rejected_with_feedback_link.isSelected()).toBe(true);

        checked_case = element(by.cssContainingText('tr.is-complete', case_to_reject_ref));
        expect(checked_case.isPresent()).toBe(true);
      });

      it('should be able to mark case as justified', function () {
        justify_btn = element(by.css('button[name="justify-' + case_to_reject_ref + '"]'));

        expect(justify_btn.getAttribute('class')).not.toContain('is-selected');
        justify_btn.click();
        expect(justify_btn.getAttribute('class')).toContain('is-selected');
      });

      it('should be able to mark case as unjustified', function () {
        unjustify_btn = element(by.css('button[name="unjustify-' + case_to_reject_ref + '"]'));

        expect(unjustify_btn.getAttribute('class')).not.toContain('is-selected');
        unjustify_btn.click();
        expect(unjustify_btn.getAttribute('class')).toContain('is-selected');
      });

      it('should be able to hide all justified cases', function () {
        hide_resolved_btn = element(by.css('.toggle-resolved'));
        resolved_cases = element.all(by.css('tr.is-complete')).get(0);

        expect(hide_resolved_btn.getAttribute('class')).toContain('is-selected');
        expect(resolved_cases.isPresent()).toBeTruthy();

        hide_resolved_btn.click();

        expect(hide_resolved_btn.getAttribute('class')).not.toContain('is-selected');
        expect(resolved_cases.isPresent()).toBeFalsy();
      });
    });
  });

  // helpers
  function get_provider () {
    return element(by.css('.ContactBlock-heading')).getText();
  }

  function do_assign () {
    var assignBtn = element(by.name('assign-provider'));
    utils.scrollTo(assignBtn);
    assignBtn.click();
  }
})();
