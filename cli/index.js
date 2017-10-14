#! /usr/bin/env node

const argv = process.argv;
const {help, debug, createReactTVApp} = require('./shared');
const scripts = require('./scripts');

if (argv.length < 2) {
  help();
} else {
  switch (argv[2]) {
    case 'init':
      if (argv.length < 4)
        return debug('app name is required, example: react-tv init <app-name>');

      let optPath = argv.length >= 5 ? argv[4] : process.cwd();
      debug('using "' + argv[3] + '" as app-name');
      debug('using "' + optPath + '" as app-path');
      createReactTVApp(argv[3], optPath);
      break;
    case 'run-webos':
      scripts.runWebOS(process.cwd());
      break;
    case 'run-webos-dev':
      scripts.runWebOSDev(process.cwd());
      break;
    default:
      help();
  }
}
