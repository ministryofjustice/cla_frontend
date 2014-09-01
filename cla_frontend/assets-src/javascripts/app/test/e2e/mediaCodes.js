/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var utils = require('./_utils'), // UTILS
      modelsRecipe = require('./_modelsRecipe');

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('Set media code on case', function () {
      it('should set a media code on a new case', function () {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get('call_centre/'+case_ref+"/");

          utils.showPersonalDetailsForm();
          utils.enterPersonalDetails({
            'full_name': 'Foo Bar Quux',
            'postcode': 'F00 B4R',
            'street': '1 Foo Bar',
            'mobile_phone': '0123456789',
            'media_code': 'Age Concern'
          });
          utils.saveCase();
          expect(displayedMediaCode()).toBe('Age Concern');
        });
      });

      function displayedMediaCode() {
        return browser.findElement(by.binding('mediaCode(media_code).label')).getText();
      }
    });
  });
})();
