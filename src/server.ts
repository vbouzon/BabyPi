/// <reference path="server/camera_server.ts" />

import http = require('http');
import express = require('express');


import srv = require('./server/camera_server');
var app = express();

//public website
app.use(express.static(__dirname + '/public'));


var server = http.createServer(app);
var silence = new srv.Server();
silence.initialize(server);

server.listen(8080);