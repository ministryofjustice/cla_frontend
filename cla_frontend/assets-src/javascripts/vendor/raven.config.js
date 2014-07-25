var dsn = document.getElementsByTagName('head')[0].getAttribute('data-sentry-dsn');
if(dsn !== ''){
    Raven.config(dsn, {
      whitelistUrls: [/[-a-zA-Z0-9]*\.dsd\.io/]
    }).install();
}
