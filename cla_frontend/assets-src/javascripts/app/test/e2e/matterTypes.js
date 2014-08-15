/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils'); // UTILS

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('Case Set Matter Types and Assign', function() {


      /**
       * Go to the assign page; if an option as_of parameter is given, it
       * will reload the page in 'mocked-time' mode.
       * If you are using this 'mocked-time' mode then make sure you
       * have set the matter types first.
       *
       * @param as_of datetime string in format (iso) yyyy-mm-ddThh:mm
       * @returns {!webdriver.promise.Promise.<void>}
       */
      function goto_assign(as_of) {
        utils.scrollTo(browser.findElement(by.css('.CaseDetails-actions')));
        browser.findElement(by.css('.CaseDetails-actions button[name="close-case"]')).click();
        var clicked = browser.findElement(by.css('.CaseDetails-actions button[name="close--assign-provider"]')).click();

        if (as_of) {
          browser.getLocationAbsUrl().then(function(url) {
            return browser.get(url+'?as_of='+encodeURIComponent(as_of));
          });
        }
        return clicked;
      }

      function fill_required_fields(fill_recommended) {
        function _fill_required_fields() {
          var $scope = angular.element('[name="notesFrm"]').scope(),
              $case = $scope.case; 
          
          $case.notes = 'Case notes'; 

          $case.$case_details_patch().then(function() {
            $case.media_code = 'AA'; 
            $case.$set_media_code();
          });

          var $pd = angular.element('[ui-view="personalDetails"]').scope().personal_details;
          $pd.full_name = 'Foo Bar Quux';
          $pd.mobile_phone = '0123456789';
          $pd.ni_number = '0123456789';
          $pd.dob = {
            day: '01',
            month: '01',
            year: '2014'
          };
          if (window.__fill_recommended) {
            $pd.postcode = 'F00 B4R';
            $pd.street = '1 Foo Bar';
          };
          
          $pd.$update($case.reference);
        }

        protractor.getInstance().driver.executeScript(
          "window.__fill_recommended="+!!fill_recommended+";"+
          "("+_fill_required_fields.toString()+")();"+
          "window.__fill_recommended=undefined;"
        );

        utils.setCategory('debt');
      }

      function checkAssign() {
        expect(browser.isElementPresent(by.css('.ContactBlock'))).toBe(true);
        expect(browser.isElementPresent(by.css('[data-centre-col] .Notice'))).toBe(true);
        expect(browser.findElement(by.css('.PageHeader h1')).getText()).toContain('Assigned to');
        expect(browser.findElement(by.css('[data-centre-col] .Notice')).getText()).toContain('Provider phone short code');
      }

      it('should not allow assigning a case without required fields', function () {
        utils.createCase();
        goto_assign();

        expect(browser.isElementPresent(by.css('.modal-content .Error[data-case-errors]'))).toBe(true);
        expect(browser.findElement(by.css('.modal-content .Error[data-case-errors]')).getText()).toContain('Name is required to close a case');
      });

      it('should give a warning when assigning a case without address fields', function () {
        utils.createCase();
        fill_required_fields();
        goto_assign();

        expect(browser.isElementPresent(by.css('.modal-content .Notice[data-case-warnings]'))).toBe(true);
        expect(browser.findElement(by.css('.modal-content .Notice[data-case-warnings]')).getText()).toContain('It is recommended to include postcode before closing a case');
      });


      it('should show modal when trying to assign without matter types set', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
      });

      it('should not allow saving modal without setting matter type 1 and 2', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(modalEl.isElementPresent(by.css('button[type="submit"]'))).toBe(true);
      });


      it('should allow saving modal after setting matter type 1 and 2', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css('input[name="matter_type1"]')).click();
        modalEl.findElement(by.css('input[name="matter_type2"]')).click();
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);
      });

      it('should go straight to assign page if MT1 and MT2 are already set', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');

        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css('input[name="matter_type1"]')).click();
        modalEl.findElement(by.css('input[name="matter_type2"]')).click();
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

        var assignCaseUrl;
        browser.getLocationAbsUrl().then(function (url) {
          assignCaseUrl = url;
        });
        browser.findElement(by.css('a[ui-sref="case_detail.edit"]')).click();
        goto_assign();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);
        browser.getLocationAbsUrl().then(function (url) {
          expect(url).toBe(assignCaseUrl);
        });
      });

      it('should assign a case to recommended provider (inside office hours)', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css('input[name="matter_type1"]')).click();
        modalEl.findElement(by.css('input[name="matter_type2"]')).click();
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

        goto_assign('2014-08-06T11:50');
        browser.findElement(by.css('button[name="assign-provider"]')).click();

        checkAssign();
      });


      it('should assign case to rota provider (outside office hours)', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css('input[name="matter_type1"]')).click();
        modalEl.findElement(by.css('input[name="matter_type2"]')).click();
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

        goto_assign('2014-08-06T19:50');
        browser.findElement(by.css('button[name="assign-provider"]')).click();

        checkAssign();
      });


      it('should assign case outside office hours without rota set', function () {
        utils.createCase();
        fill_required_fields(true);
        goto_assign();

        expect(browser.findElement(by.css('.modal-content')).getText()).toContain('Set Matter Types');
        var modalEl = browser.findElement(by.css('div.modal'));
        modalEl.findElement(by.css('input[name="matter_type1"]')).click();
        modalEl.findElement(by.css('input[name="matter_type2"]')).click();
        modalEl.findElement(by.css('button[type="submit"]')).click();
        expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

        goto_assign('2014-08-01T19:30');
        expect(browser.findElement(by.css('button[name="assign-provider"]')).isEnabled()).toBe(false);
        browser.findElements(by.repeater('provider in suggested_providers | filter:provider_search')).then(function(providers){
          providers[0].findElement(by.css('input[name="provider"]')).click();
        });

        expect(browser.findElement(by.css('button[name="assign-provider"]')).isEnabled()).toBe(true);
        browser.findElement(by.css('button[name="assign-provider"]')).click();
        checkAssign();
      });
    });
  });
})();
