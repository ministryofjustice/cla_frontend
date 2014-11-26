(function(){
  var analytics_id = document.getElementsByTagName('html')[0].getAttribute('data-analytics-id');
  var analytics_domain = document.getElementsByTagName('html')[0].getAttribute('data-analytics-domain');

  if (analytics_id && analytics_domain) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', analytics_id, analytics_domain);
  }
})();
