#!/usr/bin/env node

'use strict';

var Promise = require('promise');

var wrtc = require('wrtc');

// Connect to the given rtc-switchboard signaling server and wait for an announcement containing a
// list of IP addresses for the Linkbot Hub identified by `hostname`. The `hostname` argument
// should probably be of the form 'linkbot-hub-xxxx'.
//
// If there is a problem connecting to the rtc-switchboard signaling server, the promise will be
// rejected. If no Linkbot Hub with a matching hostname ever connects to the signaling server, the
// promise may never be resolved.
var resolveLinkbotHub = function (switchboardUri, hostname) {
    return new Promise(function(resolve, reject) {
        var switchboardOpts = {
            endpoints: ['/'],  // Prevent signaller's error event from triggering extra times.
            autoconnect: true,
            reconnect: false
        };
        var messenger = require('rtc-switchboard-messenger');
        var signaller = require('rtc-signaller')(messenger(switchboardUri, switchboardOpts));

        signaller.on('peer:filter', function(id, peer) {
            peer.allow = peer.allow && peer.hasOwnProperty('type') && peer.type === 'linkbot-hub';
            // Ignore peers in the room that aren't Linkbot Hubs.
        }).on('peer:announce', function(peer) {
            resolve(peer.ipAddresses);
            signaller.leave();
            // Once we have the Linkbot Hub's IP address list, no need to stick around.
        }).on('error', function(error) {
            reject(error);
        });

        var profile = {
            room: hostname,
            type: 'linkbot-labs'
        };

        signaller.announce(profile);
    });
};

var callLinkbotHub = function (switchboardUri, hostname) {
    return new Promise(function(resolve, reject) {
        var switchboardOpts = {
            endpoints: ['/'],  // Prevent signaller's error event from triggering extra times.
            autoconnect: true,
            reconnect: false
        };
        var messenger = require('rtc-switchboard-messenger');
        var signaller = require('rtc-signaller')(messenger(switchboardUri, switchboardOpts));

        signaller.on('peer:filter', function(id, peer) {
            peer.allow = peer.allow && peer.hasOwnProperty('type') && peer.type === 'linkbot-hub';
            // Ignore peers in the room that aren't Linkbot Hubs.
        }).on('error', function(error) {
            reject(error);
        });

        var pc = new wrtc.RTCPeerConnection(null);

        signaller.on('peer:announce', function(peer) {
            pc.setRemoteDescription(peer.description);
        });

        pc.onicecandidate = function(e) {
            var profile = {
                room: hostname,
                type: 'linkbot-labs',
                candidate: e.candidate 
            };
            console.log( 'onicecandidate(e) : ' + e);

            signaller.send('/candidate', profile);
        };

        pc.oniceconnectionstatechange = function(e) {
            console.log('oniceconnectionstatechange(e) : ' + e);
            resolve({'pc':pc, 'e':e});
        };

        pc.createOffer().then(function(desc) {
            var profile = {
                room: hostname,
                type: 'linkbot-labs',
                description: desc
            };

            signaller.announce(profile);
            return pc.setLocalDescription(desc);
        }).then( function() {
            console.log('success.');
        }, function(err) {
            console.log('error: ' + err);
        });
    });
};


// Example use.
var hostname = process.argv[2];
callLinkbotHub('https://switchboard.linkbotlabs.com/', hostname).then(function (ipAddresses) {
    console.log('Resolved', hostname, 'to', ipAddresses);
}, function (error) {
    console.error('Error resolving', hostname, ':', error);
});
