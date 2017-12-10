const run = require('./run');
const setupDevice = require('node-webos/bin/ares-setup-device.js');
const novacom = require('node-webos/bin/ares-novacom.js');

module.exports = {
  run,
  setupDevice,
  novacom,
}
