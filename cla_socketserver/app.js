var http = require('http');
var server = http.createServer().listen(8005);
var io = require('socket.io')(server);
var cookie = require('cookie');
var querystring = require('querystring');


io.use(function (socket, next) {
  if (socket.request.headers.cookie) {
    socket.request.cookie = cookie.parse(socket.request.headers.cookie);
    return next();
  }
  return next(new Error('not authorized'));
});

io.on('connection', function (socket) {
  socket.on('client', function (data) {
    socket.broadcast.emit('server', data);
  });
});
