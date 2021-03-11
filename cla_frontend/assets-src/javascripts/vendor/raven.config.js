var dsn = document.getElementsByTagName('head')[0].getAttribute('data-sentry-dsn');
var cla_environment = document.getElementsByTagName('head')[0].getAttribute('data-sentry-environment');
if(dsn !== ''){
    Raven.config(dsn, {"environment": cla_environment}).install();
}
