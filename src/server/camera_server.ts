/// <reference path="../typings/ws/ws.d.ts" />
import WebSocketServer = require('ws');
import child = require('child_process');
import stream = require('stream');
var split = require('stream-split');


var NALseparator = new Buffer([0, 0, 0, 1]);//NAL break


export class Server {

    private wss: WebSocketServer.Server;
    private readStream: stream.Readable;

    options = {
        width: 960,
        height: 540,
        fps: 12
    }

    initialize = (server) => {

        this.wss = new WebSocketServer.Server({ server: server });
        this.wss.on('connection', this.new_client);
    }


    start_feed = () => {
        var readStream = this.get_feed();
        this.readStream = readStream;

        this.readStream.on("data", this.broadcast);
    }


    get_feed = (): stream.Readable => {

        return child.spawn('raspivid', ['-t', '0', '-o', '-', '-w', this.options.width.toString(), '-h', this.options.height.toString(), '-fps', this.options.fps.toString()], { stdio: ['ignore', 'pipe', 'ignore'] }).stdout;


    }

    broadcast = (data) => {
        this.wss.clients.forEach(function (socket: WebSocketServer) {

            //if (socke)
            //    return;

            //socket.buzy = true;
            //socket.buzy = false;

            socket.send(Buffer.concat([NALseparator, data]), { binary: true }, function ack(error) {
                //socket.buzy = false;
            });
        });

    }

    new_client = (socket) => {

        console.log('New guy');

        socket.send(JSON.stringify({
            action: "init",
            width: this.options.width,
            height: this.options.height,
        }));

        socket.on("message",  (data) => {
            var cmd = "" + data, action = data.split(' ')[0];
            console.log("Incomming action '%s'", action);

            if (action == "REQUESTSTREAM")
                this.start_feed();
            if (action == "STOPSTREAM")
                this.readStream.pause();
        });

        socket.on('close',  () => {
            //this.readStream.cl;
            console.log('stopping client interval');
        });
    }
}



