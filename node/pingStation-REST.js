/*
 * uAvionix pingStation REST Receiver Example
 * Copyright (c) 2017 uAvionix Corporation
 *
 * Poll the REST webserver on a defined interval, and output to
 * console
 *
 * Adjust HOST to point to desired pingStation
 * TRAFFIC_FREQUENCY_S and STATUS_FREQUENCY_S sets polling intervals
 */

'use strict';

var HOST = '10.40.21.240';
var PORT = 80;

var TRAFFIC_FREQUENCY_S = 1;
var STATUS_FREQUENCY_S = 30;

var http = require('http');

var trafficTimer;
var statusTimer;

function validateAircraftPosition(aircraft) {
  if (aircraft.hasOwnProperty('latDD') && aircraft.hasOwnProperty('lonDD')) {
    return true;
  } else {
    return false;
  }
}

function messageReceived(message) {
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
}

var trafficOptions = {
  host: HOST,
  port: PORT,
  path: '/api/v1/traffic',
  method: 'GET'
};

var statusOptions = {
  host: HOST,
  port: PORT,
  path: '/api/v1/status',
  method: 'GET'
};

function trafficCallback(response) {
  var trafficData = '';

  // More data received
  response.on('data', function(chunk) {
    trafficData += chunk;
  });

  // Entire response received
  response.on('end', function() {
    messageReceived(trafficData);
    trafficTimer = setTimeout(function() { http.request(trafficOptions, trafficCallback).end(); }, TRAFFIC_FREQUENCY_S * 1000);
  });
}

function statusCallback(response) {
  var statusData = '';

  // More data received
  response.on('data', function(chunk) {
    statusData += chunk;
  });

  // Entire response received
  response.on('end', function() {
    messageReceived(statusData);
    statusTimer = setTimeout(function() { http.request(statusOptions, statusCallback).end(); }, STATUS_FREQUENCY_S * 1000);
  });
}

// Fire off initial requests
http.request(statusOptions, statusCallback).end();
http.request(trafficOptions, trafficCallback).end();

