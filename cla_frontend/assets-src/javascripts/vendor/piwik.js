  var _paq = _paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var hostname = document.getElementsByTagName('head')[0].getAttribute('data-piwik-hostname');
    if(hostname !== ''){
      var u=(("https:" == document.location.protocol) ? "https" : "http") + "://" + hostname + "/";
      _paq.push(['setTrackerUrl', u+'piwik.php']);
      _paq.push(['setSiteId', 1]);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript';
      g.defer=true; g.async=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
    }
  })();
