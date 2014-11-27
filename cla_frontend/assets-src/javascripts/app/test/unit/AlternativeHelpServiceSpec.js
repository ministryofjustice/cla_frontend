(function () {
  'use strict';

  /* jasmine specs for controllers go here */
  describe('AlternativeHelpService', function() {

    beforeEach(module('cla.operatorApp'));


    var scope, AlternativeHelpService;

    beforeEach(inject(function (_$rootScope_, _AlternativeHelpService_) {
      scope = _$rootScope_.$new();
      AlternativeHelpService = _AlternativeHelpService_;
    }));

    describe('service', function(){

      it('Singleton has empty selected_providers when first used', function() {
        expect(AlternativeHelpService.selected_providers).toEqual({});
        expect(AlternativeHelpService.notes).toEqual('');
      });

      it('Should clear selected_providers when clear() is called', function () {
        AlternativeHelpService.selected_providers[12] = true;
        AlternativeHelpService.notes = 'foo';
        expect(AlternativeHelpService.selected_providers).toEqual({12: true});
        expect(AlternativeHelpService.notes).toEqual('foo');
        AlternativeHelpService.clear();
        expect(AlternativeHelpService.selected_providers).toEqual({});
        expect(AlternativeHelpService.notes).toEqual('');
      });

    });
  });
})();
