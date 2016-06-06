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
}();

var messenger = require('rtc-switchboard-messenger');
var signaller = require('rtc-signaller')(messenger('http://switchboard.linkbotlabs.com/'));

signaller.on('error', function(err) {
    console.log('error: ', err);
}).on('connected', function() {
    console.log('connected');
}).on('disconnected', function() {
    console.log('disconnected');
}).on('local:announce', function(peer) {
    console.log('local:announce: ', peer);
}).on('peer:filter', function(id, peer) {
    console.log('peer:filter: ', id, peer);
}).on('peer:connected', function(id) {
    console.log('peer:connected: ', id);
}).on('peer:announce', function(peer) {
    console.log('peer:announce: ', peer);
}).on('peer:update', function(peer) {
    console.log('peer:update: ', peer);
});
// To add support for a new message type, send a message using this:
//   signaller.to(peer.id).send('/yourIdentifier', text);  // omit .to(peer.id) to broadcast?
// And receive a message using this:
//   signaller.on('message:yourIdentifier', function (text) { ... });

var profile = {
    room: os.hostname(),
    type: 'linkbot-hub',
    ipAddresses: ipAddresses
};

signaller.announce(profile);
signaller.connect();