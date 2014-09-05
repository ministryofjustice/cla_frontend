(function(){
  'use strict';

  var utils = require('../e2e/_utils'),
    CONSTANTS = require('../protractor.constants.js'),
    modelsRecipe = require('./_modelsRecipe');

  describe('Provider Feedback', function() {

    function get_provider() {
      return browser.findElement(by.css('.ContactBlock-heading')).getText();
    }

    function do_assign() {

      browser.findElement(by.css('[name=assign-provider]')).click();
    }

    function manually_select_provider() {

      browser.findElement(by.cssContainingText('.Button.Button--secondary', 'Assign other provider manually')).click();
      browser.findElement(by.cssContainingText('input[name="provider"] + strong', 'Duncan Lewis')).click();
    }

    function logout() {
      browser.findElement(by.cssContainingText('a[target="_self"]', 'Sign out')).click();
      ptor.manage().deleteAllCookies();
    }

    var case_to_reject_ref,
    case_to_feedback_without_reject_ref,
      ptor = protractor.getInstance(),
      reject_notes = 'this is feedback left with rejection',
      feedback_notes = 'this is plain feedback';

    describe('As Operator', function () {

      beforeEach(utils.setUp);

      it('should create a case as operator and assign (manually) to a provider', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
          case_to_reject_ref = case_ref;
          browser.get('call_centre/'+case_ref+'/assign/?as_of=2014-08-06T11:50');
          get_provider().then(function (provider) {
            if (provider !== 'Duncan Lewis') {
              manually_select_provider();
            }
            do_assign();

          });
        });
      });


      it('should create a case as operator and assign (manually) to a provider which wont be rejected', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
          case_to_feedback_without_reject_ref = case_ref;
          browser.get('call_centre/'+case_ref+'/assign/?as_of=2014-08-06T11:50');
          get_provider().then(function (provider) {
            if (provider !== 'Duncan Lewis') {
              manually_select_provider();
            }
            do_assign();

          });
        });
      });

      it('should logout', function () {
        this.after(function () {
          logout();
        });
      });
    });


    describe('As Provider', function () {
      beforeEach(utils.setUpAsProvider);

      it('should have example case assigned & ready to reject', function(){
        browser.get('provider/'+case_to_reject_ref+'/');
        // case is ready to be rejected/accepted.
        var reject_button = element(by.cssContainingText('.Button.Button--secondary', 'Reject')),
          reject_code = element(by.css('.modal-content input[type="radio"][name="code"][value="COI"]')),
          notes_area = element(by.css('.modal-content textarea[ng-model="notes"]')),
          leave_feedback_checkbox = element(by.css('.modal-content input[type="checkbox"][ng-model="$parent.leaveFeedback"]')),
          feedback_issue_select = element(by.css('div#s2id_autogen3')),
          feedback_issue_select_options = element.all(by.css('li.select2-results-dept-0')),
          modal_submit = element(by.css('.modal-content button.Button[type="submit"]'));

        expect(reject_button.isDisplayed()).toBe(true);

        //press reject and can see feedback
        reject_button.click();

        expect(reject_code.isDisplayed()).toBe(true);
        reject_code.click();

        expect(notes_area.isDisplayed()).toBe(true);
        notes_area.sendKeys(reject_notes);

        expect(leave_feedback_checkbox.isDisplayed()).toBe(true);
        leave_feedback_checkbox.click();

        expect(feedback_issue_select.isDisplayed()).toBe(true);
        feedback_issue_select.click();

        feedback_issue_select_options.then(function (li) {
          li[0].click();
        });

        expect(modal_submit.isDisplayed()).toBe(true);
        modal_submit.click();

      });

      it('should have example case assigned & ready to feedback without rejecting', function(){
        var feedback_issue_select = element(by.css('div#s2id_autogen1')),
          feedback_issue_select_options = element.all(by.css('li.select2-results-dept-0')),
          notes_area = element(by.css('div[ui-view="feedback"] form  textarea[ng-model="newFeedback.comment"]')),
          submit_button = element(by.css('div[ui-view="feedback"] form input.Button[type="submit"]'));
        browser.get('provider/'+case_to_feedback_without_reject_ref+'/');
        expect(element(by.cssContainingText('.Button.Button--secondary', 'Reject')).isPresent()).toBe(true);

        expect(feedback_issue_select.isDisplayed()).toBe(true);
        feedback_issue_select.click();
        feedback_issue_select_options.then(function (li) {
          li[0].click();
        });

        expect(notes_area.isDisplayed()).toBe(true);
        notes_area.sendKeys(feedback_notes);

        expect(submit_button.isDisplayed()).toBe(true);
        submit_button.click();
      });

      it('should logout', function () {
        this.after(function () {
          logout();
        });
      });

    });


    describe('As Operator', function () {
      beforeEach(utils.setUp);
      it('feedback should be created for rejected case', function () {
        var case_rejected_with_feedback_link = element(by.cssContainingText('tr td a', case_to_reject_ref));

        browser.get('call_centre/feedback/');
        expect(case_rejected_with_feedback_link.isPresent()).toBe(true);

      });

      it('feedback should be created for non-rejected case', function () {
        var  case_not_rejected_with_feedback_link = element(by.cssContainingText('tr td a', case_to_feedback_without_reject_ref));
        browser.get('call_centre/feedback/');
        expect(case_not_rejected_with_feedback_link.isPresent()).toBe(true);

      });

      it('should logout', function () {
        this.after(function () {
          logout();
        });
      });

    });
  });
})();
