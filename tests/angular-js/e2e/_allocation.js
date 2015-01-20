(function(){
  'use strict';

  var utils = require('./_utils'),
      modelsRecipe = require('./_modelsRecipe'),
      // custom config
      num_cases = 300,
      allocations = {},
      weights = {
        'Ty Arian': 24.0,
        'CES': 19.0,
        'Duncan Lewis': 19.0,
        'DHA': 19.0,
        'Shelter': 19.0
      };

  describe('operatorApp', function() {
    beforeEach(utils.setUp);

    //afterEach(utils.debugTeardown);

    describe('Case allocation', function() {
      it('should be distributed according to specified weighting', function () {
        for (var i = num_cases; i >= 0; i -= 1) {
          test_assign(i);
        }
      });
    });
  });

  function test_assign(i) {
    modelsRecipe.Case.createForAllocationTest().then(function (case_ref) {
      browser.get('call_centre/'+case_ref+'/assign/');
      get_provider().then(increment(allocations)).then(function () {
        do_assign();
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

  function get_provider() {
    return $('.ContactBlock-heading').getText();
  }

  function assert_distribution(dist, weights) {
    weights = normalize(weights);
    dist = normalize(dist);
    for (var key in weights) {
      expect(key in dist).toBe(true);
      expect(Math.abs(weights[key] - dist[key])).toBeLessThan(0.05);
    }
  }

  function do_assign() {
    $('[name=assign-provider]').click();
  }

  function normalize(weights) {
    var total = distribution_total(weights);
    for (var key in weights) {
      weights[key] = weights[key] ? weights[key] / total : 0;
    }
    return weights;
  }

})();
