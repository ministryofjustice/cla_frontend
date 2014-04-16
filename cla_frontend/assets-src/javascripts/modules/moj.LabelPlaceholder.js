(function () {
  'use strict';

  moj.Modules.LabelPlaceholder = {
    el: '.js-LabelPlaceholder',
    className: 'is-focused',

    init: function () {
      _.bindAll(this, 'render', 'renderEach', 'onFocus', 'onFocusOut');
      this.cacheEls();
      this.bindEvents();
    },

    cacheEls: function () {
      this.$inputs = $(this.el);
    },

    bindEvents: function () {
      // set focused selector to parent label
      this.$inputs
        .on('focus', this.onFocus)
        .on('focusout', this.onFocusOut);

      moj.Events.on('render', this.render);
    },

    render: function () {
      this.$inputs.each(this.renderEach);
    },

    renderEach: function (i, el) {
      var $el = $(el);
      if ($el.val() !== '') {
        $el.addClass(this.className);
      }
    },

    onFocus: function (e) {
      $(e.target).addClass(this.className);
    },

    onFocusOut: function (e) {
      var $el = $(e.target);
      if ($el.val() === '') {
        $el.removeClass(this.className);
      }
    }
  };
}());