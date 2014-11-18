(function () {
  'use strict';

  angular.module('cla.services')
    .run(['postal', '$analytics', function(postal, $analytics) {
      var $body = angular.element('body');
      var trackEvent = function (data, envelope) {
        var eventData = {
          category: envelope.channel
        };

        if (data) {
          if (data.value !== undefined) {
            eventData.value = data.value;
          }
          if (data.label !== undefined) {
            eventData.label = data.label;
          }
        }

        // $analytics.eventTrack(envelope.topic, {  category: 'envelope.channel' });
        console.log(envelope.topic);
        console.log(eventData);
      };

      // Address Finder
      var addressFinder = postal.channel('AddressFinder');
      addressFinder.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Notes History
      var notesHistory = postal.channel('NotesHistory');
      notesHistory.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Eligibility Check
      var EligibilityCheck = postal.channel('EligibilityCheck');
      EligibilityCheck.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Guidance
      var Guidance = postal.channel('Guidance');
      Guidance.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Call Scripts
      var CallScript = postal.channel('CallScript');
      CallScript.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Assign Provider
      var AssignProvider = postal.channel('AssignProvider');
      AssignProvider.subscribe({
        topic: '*',
        callback: trackEvent
      });

      // Search filters
      var SearchFilter = postal.channel('SearchFilter');
      SearchFilter.subscribe({
        topic: '*',
        callback: trackEvent
      });


      $body
        // Details/Summary clicks
        .on('click', 'summary', function () {
          var $details = angular.element(this).parent('details');
          var summaryText = angular.element(this).text();

          if (
            (!$details.hasClass('is-notnative') && !$details.is('[open]')) ||
            ($details.hasClass('is-notnative') && $details.hasClass('is-open'))
          ) {
            // $analytics.eventTrack('click', {  category: 'Summary', label: summaryText });
            console.log('summary click', summaryText);
          }
        })
        // External link clicks
        .on('click', '[target="_blank"]', function () {
          var $this = angular.element(this);
          var text = $this.text();
          var loc = $this.attr('href');

          // $analytics.eventTrack('click', {  category: 'Outbound', label: text, value: loc });
          console.log(text, loc);
        });
    }]);
})();
