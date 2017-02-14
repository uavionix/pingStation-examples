/*
 * uAvionix pingStation WebSocket Receiver Example
 * Copyright (c) 2017 uAvionix Corporation
 *
 * Receive live updates over the WebSocket interface, and
 * output to console
 *
 * Adjust HOST to point to desired pingStation
 *
 * Note: No buffering provided on WebSocket receive, it assumes
 *       a single JSON object per WebSocket messages. This is
 *       not realistic for a production receiver.
 */

'use strict';

var HOST = '10.40.21.240';
var PORT = 80;

var wsUri = 'ws://' + HOST + ':' + PORT;
var WebSocket = require('ws');
var ws = new WebSocket(wsUri);

ws.on('open', function() {
  console.log('Websocket connection opened to ' + wsUri);
});

function validateAircraftPosition(aircraft) {
  if (aircraft.hasOwnProperty('latDD') && aircraft.hasOwnProperty('lonDD')) {
    return true;
  } else {
    return false;
  }
}

ws.on('message', function(message, flags) {
  try {
    var jsonMessage = JSON.parse(message.toString());
  } catch (err) {
    // Invalid JSON
    console.log('- Invalid JSON data');
    console.log('--' + message + '--');
  }
  if (jsonMessage) {
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
      console.log('- Error processing message');
      console.log(err.stack);
    }
  }
});

