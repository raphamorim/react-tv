#! /usr/bin/env node

const argv = process.argv;
const path = require('path');
const {help, debug, createReactTVApp} = require('./shared');
const { WebOS } = require('./scripts');

if (argv.length < 2) {
  return help();
}

const command = argv[2];
switch (command) {
  case 'init':
    let appName;
    if (argv.length > 3) {
      appName = argv[3];
    }

    createReactTVApp(appName);
    break;

  case 'run-webos':
    let device;
    if (argv.length > 3) {
      device = argv[3];
    }

    WebOS.run(process.cwd(), device);
    break;

  case 'setup-webos':
    WebOS.setupDevice();
    break;

  default:
    help();
}
