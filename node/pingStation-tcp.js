/*
 * uAvionix pingStation UDP Receiver Example
 * Copyright (c) 2017 uAvionix Corporation
 *
 * Receive live updates over the UDP interface, and
 * output to console
 *
 * Adjust PORT to specify receive port
 */

'use strict';

var HOST = '10.40.21.240';
//var HOST = '10.100.6.162';
var PORT = 30001;

var net = require('net')
var client = new net.Socket();
client.connect(PORT, HOST, function() {
	console.log('Connected');
		});

client.on('data', function(data) {
		console.log('Received: ' + data);
		});

client.on('close', function() {
		console.log('Connection closed');
		});
