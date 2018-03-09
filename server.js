const express = require('express');
const path = require('path');
const app = express();
const redis = require('redis');
const redisAdapter = require('socket.io-redis');
const server = require('http').Server(app);
const io = require('socket.io')(server);
var logger = require('./logger.js');

const client = require('./database.js');

const port = process.env.PORT || 3001;
const redis_host = process.env.REDIS_HOST || 'localhost';
const redis_port = process.env.REDIS_PORT || 6379;
const redis_pwd = process.env.REDIS_PWD || 'Socket@redis.123';

// connect to the socket via redis adapter
const pub = redis.createClient(redis_port, redis_host, { auth_pass: redis_pwd });
const sub = redis.createClient(redis_port, redis_host, { auth_pass: redis_pwd });

io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));

// io.adapter(redisAdapter({ host: 'localhost', port: 6379, auth_pass: "redis"}));

app.set('port', port);

app.get('/', function(request, response) {
  response.send('******** service started ************');
});

server.listen(port);

console.log('server started on port ' + port);

require('socketio-auth')(io, {
  authenticate: function (socket, data, callback) {
    //get credentials sent by the client

    var id = data.id;
    var userId = data.userId;
    client.query('SELECT id from accesstoken where id = $1', [id], function(err, result){
      if (err || result.rowCount != 1) {
        console.log('Authorization Falied');
        return callback(null, false);
      }
      logger.info({
        socket_id: socket.id,
        message: "Connection Authorized",
        timestamp: new Date()
      });

      console.log('Authorized');
      return callback(null, true);
    });
  }
});

io && io.on('connection', function (socket) {

  logger.info({
    socket_id: socket.id,
    message: "initiate connection",
    timestamp: new Date()
  });
  console.log('- connected -', socket.id);

  socket.on('disconnect', function () {
    logger.info({
      socket_id: socket.id,
      message: "User left channel",
      timestamp: new Date()
    });
    console.log('- disconnected -', socket.id);
  });

  // listen to the clients connected in the cluster
  socket.on('EMIT_TO_REDIS_CLUSTER', function (options) {
    var eventName = options.eventName; //channel name.
    var data = options.data; // actual data.
    socket.broadcast.emit(eventName, data);
  });
});
