/* jshint unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils'), // UTILS
      modelsRecipe = require('./_modelsRecipe');

  describe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    // USERFUL FOR DEBUGGING:
    // afterEach(utils.debugTeardown);

    describe('Case allocation', function() {


      it('should be distributed according to specified weighting', function () {
        var num_cases = 100;
        var allocations = {};

        var weights = {
          'FLG': 0.5,
          'Coop': 0.5,
          'Duncan Lewis': 0.5
        };

        for (var i = num_cases; i--;) {
          (function (i) {
            modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
              browser.get('call_centre/'+case_ref+'/assign/');
              get_provider().then(increment(allocations)).then(function () {
                do_assign();
                if (i == 0) {
                  console.log('cases assigned', allocations);
                  assert_distribution(allocations, weights);
                }
              });
            });
          })(i);
        }
      });

      function increment(count) {
        return function(provider) {
          if (!(provider in count)) {
            count[provider] = 0;
          }
          count[provider]++;
        }
      }

      function distribution_total(dist) {
        var total = 0;
        for (var key in dist) {
          total += dist[key];
        }
        return total;
      }

      function get_provider() {
        return browser.findElement(by.css('.ContactBlock-heading')).getText();
      }

      function do_assign() {
        browser.findElement(by.css('[name=assign-provider]')).click();
      }

      function assert_distribution(dist, weights) {
        weights = normalize(weights);
        dist = normalize(dist);
        for (var key in weights) {
          expect(Math.abs(weights[key] - dist[key])).toBeLessThan(0.05);
        }
      }

      function normalize(weights) {
        var total = distribution_total(weights);
        for (var key in weights) {
          weights[key] = weights[key] ? weights[key] / total : 0;
        }
        return weights;
      }

    });
  });
})();
