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

    let optPath = argv.length >= 5
      ? argv[4]
      : process.cwd();

    createReactTVApp(appName, optPath);
    break;

  case 'run-webos':
    if (argv.length < 4) {
      return debug(
        'entry is required, example: react-tv run-webos <entry>'
      );
    } else {
      scripts.runWebOS(
        process.cwd(),
        path.resolve(process.cwd(), argv[3])
      );
    }
    break;

  default: help();
}
