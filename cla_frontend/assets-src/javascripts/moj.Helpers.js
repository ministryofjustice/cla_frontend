(function () {
  'use strict';

  // helper to return the scroll position of an element
  moj.Helpers.scrollTo = function(e) {
    var $target = e.target !== undefined ? $($(e.target).attr('href')) : $(e),
        $scrollEl = $('html, body'),
        topPos = moj.Helpers.scrollPos($target);

    $scrollEl
      .animate({
        scrollTop: topPos
      }, 300)
      .promise()
      .done(function() {
        $target.closest('.FormRow, form').find('input:not([type=hidden]), select, textarea').first().focus();
      });
  };

  // helper to return the scroll position of an element
  moj.Helpers.scrollPos = function(target) {
    /*jshint laxbreak: true */
    return target.offset().top;
  };
})();