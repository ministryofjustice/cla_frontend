(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      // custom config
      num_cases = 300,
      allocations = {},
      weights = {
        'FLG': 0.5,
        'Coop': 0.5,
        'Duncan Lewis': 0.5
      };

  function createCase(i) {
    modelsRecipe.Case.createReadyToAssign().then(function (case_ref) {
      browser.get('call_centre/'+case_ref+'/assign/');
      browser.findElement(by.css('.ContactBlock-heading')).getText().then(increment(allocations)).then(function () {
        browser.findElement(by.css('[name=assign-provider]')).click();
        if (i === 0) {
          console.log('cases assigned', allocations);
          assert_distribution(allocations, weights);
        }
      });
    });
  }

  function increment(count) {
    return function(provider) {
      if (!(provider in count)) {
        count[provider] = 0;
      }
      count[provider] += 1;
    };
  }

  function distribution_total(dist) {
    var total = 0;
    for (var key in dist) {
      total += dist[key];
    }
    return total;
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

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    describe('Case allocation', function() {
      it('should be distributed according to specified weighting', function () {
        for (var i = num_cases; i>0; i-=1) {
          createCase(i);
        }
      });
    });
  });
})();
