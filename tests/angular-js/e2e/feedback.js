(function () {
  'use strict';

  var utils = require('./_utils'),
      CONSTANTS = require('../protractor.constants');

  var feedbackButton = element(by.css('.feedbackButton'));
  var FeedbackPopover = element(by.css('.FeedbackPopover'));

  describe('Send feedback', function () {
    beforeEach(utils.setUp);

    describe('An operator', function () {
      it('should be able to see the feedback button', function () {
        browser.get(CONSTANTS.callcentreBaseUrl);

        expect(browser.getCurrentUrl()).toContain(CONSTANTS.callcentreBaseUrl);
        expect(feedbackButton.isPresent()).toBe(true);
      });

      it('should be able to see popover when feedback button is clicked', function () {
        feedbackButton.click();

        expect(FeedbackPopover.isPresent()).toBe(true);
      });
    });
  });
})();
