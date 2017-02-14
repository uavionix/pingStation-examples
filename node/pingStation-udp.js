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

var HOST = '0.0.0.0';
var PORT = 30000;

var dgram = require('dgram')
var udpServer = dgram.createSocket('udp4');

udpServer.on('listening', function() {
  console.log('UDP server listening on ' + udpServer.address().address + ':' + udpServer.address().port);
});

udpServer.on('error', function(err) {
  console.log('UDP server error: ' + err);
});

function validateAircraftPosition(aircraft) {
  if (aircraft.hasOwnProperty('latDD') && aircraft.hasOwnProperty('lonDD')) {
    return true;
  } else {
    return false;
  }
}

udpServer.on('message', function(message, remote) {
  try {
    var jsonMessage = JSON.parse(message.toString());
  } catch (err) {
    // Invalid JSON
    console.log('- Invalid packet from ' + remote.address + ':' + remote.port);
  }
  try {
    if (jsonMessage.hasOwnProperty('aircraft')) {
      for (let aircraft of jsonMessage['aircraft']) {
        console.log('Aircraft: ' + aircraft.icaoAddress + ', pingStation: ' + aircraft.pingStationGuid);
        // Only display if we have a valid position
        if (validateAircraftPosition(aircraft)) {
          var selectedData = {
            lat: aircraft.latDD,
            lon: aircraft.lonDD,
            emitterType: aircraft.emitterType,
            altitudeType: aircraft.altitudeType
          };
          // Optional fields
          if (aircraft.hasOwnProperty('altitudeMM')) selectedData.altitudeMM = aircraft.altitudeMM;
          if (aircraft.hasOwnProperty('headingDE2')) selectedData.headingDE2 = aircraft.headingDE2;
          if (aircraft.hasOwnProperty('callsign')) selectedData.callsign = aircraft.callsign;
          console.log(selectedData);
        }
      }
    } else if (jsonMessage.hasOwnProperty('status')) {
      var pingStationStatus = jsonMessage['status'];
      console.log('Status: ' + pingStationStatus.pingStationGuid);
      console.log(pingStationStatus);
    } else {
      console.log('  Unknown Message');
      console.log(message.toString());
    }
  } catch (err) {
    // Processing error
    console.log('- Error processing message from ' + remote.address + ':' + remote.port);
    console.log(err.stack);
  }
});

udpServer.bind(PORT, HOST);
