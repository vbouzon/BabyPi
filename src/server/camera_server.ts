﻿/// <reference path="../typings/ws/ws.d.ts" />
import WebSocketServer = require('ws');
import child = require('child_process');
import stream = require('stream');
var Splitter = require('stream-split');


var NALseparator = new Buffer([0, 0, 0, 1]);//NAL break


export class Server {

    private wss: WebSocketServer.Server;
    private readStream: stream.Readable;

    options = {
        width: 640,
        height: 480,
        fps: 24
    }

    initialize = (server) => {

        this.wss = new WebSocketServer.Server({ server: server });
        this.wss.on('connection', this.new_client);
    }


    start_feed = () => {
        var readStream = this.get_feed();
        this.readStream = readStream;

        var spl = new Splitter(NALseparator);
        readStream = readStream.pipe(spl);
        readStream.on("data", this.broadcast);
    }


    get_feed = (): stream.Readable => {

        return child.spawn('raspivid', ['--nopreview', '-ih', '-t', '0', '-o', '-', '-w', this.options.width.toString(), '-h', this.options.height.toString(), '-fps', this.options.fps.toString()], { stdio: ['ignore', 'pipe', 'ignore'] }).stdout;


    }

    broadcast = (data) => {
        this.wss.clients.forEach(function (socket: WebSocketServer) {

            //if (socke)
            //    return;

            //socket.buzy = true;
            //socket.buzy = false;
            console.log(data);
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
        
        });

        socket.on('close',  () => {
            //this.readStream.cl;
            console.log('stopping client interval');
        });
    }
}



