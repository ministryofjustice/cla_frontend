(function(){
  var html = document.getElementsByTagName('html')[0];
  var analytics_id = html.getAttribute('data-analytics-id');
  var analytics_domain = html.getAttribute('data-analytics-domain');
  var ngApp = html.getAttribute('ng-app');

  if (analytics_id && analytics_domain) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', analytics_id, analytics_domain);
    // non ng tracking
    if (!ngApp) {
      ga('send', 'pageview');
    }
  }
})();
