(function () {
  'use strict';

  /* jasmine specs for controllers go here */
  describe('Pence To Pounds directive', function() {

    beforeEach(module('cla.directives'));


    var scope, elem;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
      scope.testModel = 500;
    }));


    function compileDirective(template) {
      if (!template) template = '<form name="form"><input name="num" type="number" ng-model="testModel" cla-pence-to-pounds></form>';
      inject(function($compile) {
        elem = $compile(template)(scope).find('input');
      });
      scope.$digest();
    }

    describe('PenceToPounds', function(){

      beforeEach(function () {
        compileDirective();
      });

      it("can parse model in pence and format in pounds", function() {
        expect(scope.testModel).toBe(elem[0].valueAsNumber * 100);
      });

      it("can parse user input in pounds and set model in pence", function() {
        scope.form.num.$setViewValue('10');
        expect(scope.testModel).toBe(1000);
      });


      it("can ignore bad user input", function() {
        scope.form.num.$setViewValue('$10');
        expect(scope.testModel).toBe(void(0));
      });

    });
  });
})();
