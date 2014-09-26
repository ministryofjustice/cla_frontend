var http = require('http');
var server = http.createServer().listen(8005);
var io = require('socket.io')(server);
var nsp = io.of('/socket.io');
var cookie = require('cookie');
var querystring = require('querystring');
var Promise = require('promise');


// function validate_sessionid(sessionid) {
//   return new Promise(function (fulfill, reject) {
//     var options = {
//       method: 'HEAD',
//       host: 'localhost',
//       port: '8001',
//       path: '/call_centre/',
//       cookie: 'sessionid=' + sessionid
//     };
//     var request = http.request(options);

//     request.on('response', function (response) {
//       if (redirected_to_login(response)) {
//         reject(Error('not authorized'));
//       }
//       fulfill();
//     });

//     request.on('error', function (e) {
//       reject(Error('Problem with request: ' + e.message));
//     });

//     request.end();
//   });
// }

// function redirected_to_login(response) {
//   return 'Location' in response.headers;
// }

// io.use(function (socket, next) {
//   if (socket.request.headers.cookie) {
//     socket.request.cookie = cookie.parse(socket.request.headers.cookie);
// //    validate_sessionid(socket.request.cookie.sessionid).then(next, function (e) {
// //      log('FAIL invalid sessionid', socket);
// //      next(new Error('not authorized: ' + e.message));
// //    });
//     next();
//   } else {
//     log('FAIL no cookie');
//     next(new Error('not authorized'));
//   }
// });

nsp.on('connection', function (socket) {
  log('connected', socket);

  socket.on('client', function (data) {
    socket.broadcast.emit('server', data);
  });

  socket.on('disconnect', function () {
    log('disconnected', socket);
  });
});

function log(message, socket) {
  // console.log(JSON.stringify({
  //   "@version": 1,
  //   "@timestamp": (new Date()).toISOString(),
  //   "message": message,
  //   "sessionid": socket.request.cookie.sessionid,
  //   "clientip": clientIp(socket.request),
  //   "user-agent": socket.request.headers['user-agent']
  // }));
}

// function clientIp(req) {
//   if (!req.connection || !req.socket || !req.connection.socket) {
//     return null;
//   }
  
//   return req.headers['x-forwarded-for'] ||
//     req.connection.remoteAddress ||
//     req.socket.remoteAddress ||
//     req.connection.socket.remoteAddress;
// }
