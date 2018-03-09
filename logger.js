var winston = require('winston');
var fs = require('fs');

const socketInfo = new (winston.Logger)({
   transports: [
     new (winston.transports.File)({
       name: 'socket',
       filename: 'logs/socket_info.log',
       level: 'info'
     })
   ]
 });

 exports.info = function(logContent) {
   socketInfo.info(logContent);
 };
