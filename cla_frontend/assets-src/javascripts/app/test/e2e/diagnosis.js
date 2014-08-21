/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      modelsRecipe = require('./_modelsRecipe'),
      utils = require('./_utils'), // UTILS
      APP_BASE_URL = utils.APP_BASE_URL;

  describe('Operator Scope Diagnosis', function (){
    // logs the user in before each test
    beforeEach(utils.setUp);

    describe('Scope diagnosis', function () {
      it('should create an in scope diagnosis', function (){
        modelsRecipe.Case.createEmpty().then(function(caseRef) {
          browser.get('call_centre/' + caseRef + '/diagnosis/');
          // browser.pause(10000);
          // browser.findElement(by.buttonText('Create scope diagnosis')).click();
        });
      });

      it('should be able to delete a scope diagnosis', function (){

      });

      it('should create an out of scope diagnosis', function (){

      });
    });
  });
})();
