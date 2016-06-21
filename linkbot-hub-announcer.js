#!/usr/bin/env node

'use strict';

var os = require('os');

var ipAddresses = function () {
    // Generate a list of IPv4 addresses associated with eth0 and wlan0, eth0 ordered first if
    // available.
    function isIPv4 (alias) { return alias.family === 'IPv4'; }
    var ipAddresses = [];
    var interfaces = os.networkInterfaces();
    var interfaceExists = interfaces.hasOwnProperty.bind(interfaces);
    ['eth0', 'wlan0'].filter(interfaceExists).forEach(function (name) {
        // Each interface object is a list of IP address aliases.
        interfaces[name].filter(isIPv4).forEach(function (alias) {
            ipAddresses.push(alias.address);
        });
    });
    return ipAddresses;
};

var switchboardUri = 'https://switchboard.linkbotlabs.com/';
var switchboardOpts = {
    endpoints: ['/'],  // Prevent signaller's error event from triggering extra times.
    autoconnect: true,
    reconnect: true
};
var messenger = require('rtc-switchboard-messenger');
var signaller = require('rtc-signaller')(messenger(switchboardUri, switchboardOpts));

var announceIpAddresses = function () {
    var profile = {
        room: os.hostname(),
        type: 'linkbot-hub',
        ipAddresses: ipAddresses()
    };
    signaller.announce(profile);
};

var tenMinutesInMs = 600000;

announceIpAddresses();
// Announce ourselves immediately after the connection is established.
var announcementLoop = setInterval(announceIpAddresses, tenMinutesInMs);
// Send an announcement every ten minutes to try to keep the connection alive.

var now = function () {
    return new Date().toISOString();
}

signaller.on('error', function(err) {
    console.log(now(), 'error: ', err);
    clearInterval(announcementLoop);
    // If there's an error, quit and let systemd restart us.
}).on('connected', function() {
    console.log(now(), 'connected');
}).on('disconnected', function() {
    console.log(now(), 'disconnected');
}).on('local:announce', function(peer) {
    console.log(now(), 'local:announce: ', peer);
}).on('peer:filter', function(id, peer) {
    console.log(now(), 'peer:filter: ', id, peer);
}).on('peer:connected', function(id) {
    console.log(now(), 'peer:connected: ', id);
}).on('peer:announce', function(peer) {
    console.log(now(), 'peer:announce: ', peer);
}).on('peer:update', function(peer) {
    console.log(now(), 'peer:update: ', peer);
});
// To add support for a new message type, send a message using this:
//   signaller.to(peer.id).send('/yourIdentifier', text);  // omit .to(peer.id) to broadcast?
// And receive a message using this:
//   signaller.on('message:yourIdentifier', function (text) { ... });

signaller.connect();
