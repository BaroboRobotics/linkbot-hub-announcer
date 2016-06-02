# Linkbot Hub IP Address Announcer

To quickly broadcast a Linkbot Hub's IP address, run `npm install && ./announcer.js`

#### Installing the IP Address Announcer as a `systemd` Service

Execute:

```
chmod +x announcer.js
npm install
sudo cp linkbot-hub-announcer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start linkbot-hub-announcer
```

To see if it's working, run `sudo journalctl --follow -u linkbot-hub-announcer`. If you don't see
big scary errors, try an end-to-end test with `./test-client.js linkbot-hub-xxxx`. You should see
the RPi's IP address(es) printed out.
