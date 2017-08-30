const argv = process.argv;
const webOS = require('./webos');
const {help, debug, createReactTVApp} = require('./shared');

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
      createReactTVApp(argv[3], optPath).then(result => {
        // webOS.init(optPath);
      });
      break;
    case 'run-webos':
      console.log('run-webos');
      break;
    case 'run-webos-dev':
      console.log('run-webos');
      break;
    default:
      help();
  }
}
