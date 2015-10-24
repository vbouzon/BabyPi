/// <reference path="../typings/ws/ws.d.ts" />
var WebSocketServer = require('ws');
var child = require('child_process');
var Splitter = require('stream-split');
var NALseparator = new Buffer([0, 0, 0, 1]); //NAL break
var Server = (function () {
    function Server() {
        var _this = this;
        this.options = {
            width: 960,
            height: 540,
            fps: 12
        };
        this.initialize = function (server) {
            _this.wss = new WebSocketServer.Server({ server: server });
            _this.wss.on('connection', _this.new_client);
        };
        this.start_feed = function () {
            var readStream = _this.get_feed();
            _this.readStream = readStream;
            var spl = new Splitter(NALseparator);
            readStream = readStream.pipe(spl);
            spl.on("data", _this.broadcast);
        };
        this.get_feed = function () {
            return child.spawn('raspivid', ['-t', '0', '-o', '-', '-w', _this.options.width.toString(), '-h', _this.options.height.toString(), '-fps', _this.options.fps.toString()], { stdio: ['ignore', 'pipe', 'ignore'] }).stdout;
        };
        this.broadcast = function (data) {
            _this.wss.clients.forEach(function (socket) {
                //if (socke)
                //    return;
                //socket.buzy = true;
                //socket.buzy = false;
                socket.send(Buffer.concat([NALseparator, data]), { binary: true }, function ack(error) {
                    //socket.buzy = false;
                });
            });
        };
        this.new_client = function (socket) {
            console.log('New guy');
            socket.send(JSON.stringify({
                action: "init",
                width: _this.options.width,
                height: _this.options.height,
            }));
            socket.on("message", function (data) {
                var cmd = "" + data, action = data.split(' ')[0];
                console.log("Incomming action '%s'", action);
                if (action == "REQUESTSTREAM")
                    _this.start_feed();
            });
            socket.on('close', function () {
                //this.readStream.cl;
                console.log('stopping client interval');
            });
        };
    }
    return Server;
})();
exports.Server = Server;
//# sourceMappingURL=camera_server.js.map