(function(){
  'use strict';
  var utils = require('./_utils');
  var CONSTANTS = require('../protractor.constants');

  var notice = element(by.cssContainingText('.Notice', '(from capita\'s system) that match your search criteria'));

  describe('historc cases', function(){

    beforeEach(utils.setUp);

    describe('no historic results', function(){


      it('should not show historc suggestions if search doesn\'t match', function(){
        var query = element(by.name('q'));

        browser.get(CONSTANTS.callcentreBaseUrl);
        expect(browser.getCurrentUrl()).toContain(CONSTANTS.callcentreBaseUrl);
        // search
        query.sendKeys('Bar123');
        element(by.name('case-search-submit')).submit();

        expect(browser.getCurrentUrl()).toContain('search=Bar123');
        expect(notice.isPresent()).toBe(false);
      });

    });

    describe('with historic results', function(){

      it('should show historc suggestions notice if search matches', function(){
        var query = element(by.name('q'));

        browser.get(CONSTANTS.callcentreBaseUrl);
        expect(browser.getCurrentUrl()).toContain(CONSTANTS.callcentreBaseUrl);
        // search
        query.sendKeys('bob');
        element(by.name('case-search-submit')).submit();

        expect(browser.getCurrentUrl()).toContain('search=bob');
        expect(notice.isPresent()).toBe(true);
      });

      it('should allow you to view historic cases', function(){
        element(by.cssContainingText('a', 'View historic cases')).click();
        expect(browser.getCurrentUrl()).toContain('historic');
      });

      it('should keep the search term in the new state url', function(){
        expect(browser.getCurrentUrl()).toContain('search=bob');
      });

      it('should be able to visit the detail page', function(){
        // case 3000178 comes from fixtures
        var caseLink = element(by.cssContainingText('a', '3000178'));
        caseLink.click();
        expect(browser.getCurrentUrl()).toContain('3000178');
      });


    });

  });

})();
