/// <reference path="server/camera_server.ts" />
var http = require('http');
var express = require('express');
var srv = require('./server/camera_server');
var app = express();
//public website
app.use(express.static(__dirname + '/public'));
var server = http.createServer(app);
var silence = new srv.Server();
silence.initialize(server);
server.listen(8080);
//# sourceMappingURL=server.js.map