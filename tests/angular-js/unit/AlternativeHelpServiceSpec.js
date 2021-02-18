(function () {
  'use strict';

  /* jasmine specs for controllers go here */
  describe('AlternativeHelpService', function() {

    beforeEach(module('cla.operatorApp'));
    angular.module('ngRaven', [])

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

  describe('Alternative Help controller tests', function() {

    beforeEach(module('cla.operatorApp'));

    var scope;

    beforeEach(inject(function (_$rootScope_, $controller) {
      scope = _$rootScope_.$new();
      $controller('AlternativeHelpCtrl', {$scope: scope, kb_providers: 'unused', kb_categories: 'unused', categories: 'unused'});
    }));

    describe('service', function(){
      it('Should take you to a link showing providers in your area', function() {
        scope.personal_details = {postcode: 'E174QB'};
        expect(scope.getF2fDeepLink()).toBe('https://find-legal-advice.justice.gov.uk/?postcode=E174QB');
      });

      it('Should URL escape the postcodes given', function() {
        scope.personal_details = {postcode: 'E17 4QB'};
        expect(scope.getF2fDeepLink()).toBe('https://find-legal-advice.justice.gov.uk/?postcode=E17%204QB');
      });
    });
  });
})();
