# Linkbot Hub IP Address Announcer

To quickly broadcast a Linkbot Hub's IP address, run `npm install && ./announcer.js`

#### Installing the IP Address Announcer as a `systemd` Service

Execute:

```
sudo npm install -g
sudo cp linkbot-hub-announcer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable linkbot-hub-announcer
sudo systemctl start linkbot-hub-announcer
sudo systemctl status linkbot-hub-announcer
```

To see if it's working, run `sudo journalctl --follow -u linkbot-hub-announcer`. If you don't see
big scary errors, try an end-to-end test with `./test-client.js linkbot-hub-xxxx`. You should see
the RPi's IP address(es) printed out. Now run `./test-client.js linkbot-hub-xxxx` on a different
machine and reboot your RPi. Your other machine should print out your RPi's IP address as soon as
its network is configured.
