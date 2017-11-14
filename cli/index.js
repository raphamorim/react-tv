#! /usr/bin/env node

const argv = process.argv;
const path = require('path');
const {help, debug, createReactTVApp} = require('./shared');
const scripts = require('./scripts');

if (argv.length < 2) {
  return help();
}

const command = argv[2];
switch (command) {
  case 'init':
    let appName = false;
    if (argv.length < 4) {
      appName = argv[3];
    }

    let optPath = argv.length >= 5 ? argv[4] : process.cwd();
    createReactTVApp(appName, optPath);
    break;

  case 'run-webos':
    scripts.runWebOS(process.cwd());
    break;

  default:
    help();
}
