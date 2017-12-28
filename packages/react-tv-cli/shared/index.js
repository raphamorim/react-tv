const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const replace = require('node-replace');

function debug(msg) {
  console.log(chalk.dim('[react-tv]'), msg);
}

function version() {
  console.log('');
  console.log(
    'react-tv version:',
    chalk.yellow(require(path.resolve(__dirname, '../package.json')).version)
  );
}

function help() {
  console.log('');
  console.log(chalk.yellow('Common Commands: \n'));
  console.log(
    chalk.bgYellow(' init '),
    chalk.dim('Init or sync react-tv project')
  );
  console.log(
    chalk.bgYellow(' help '),
    chalk.dim('Output react-tv cli commands')
  );

  console.log(chalk.blueBright('\nWebOS Commands: \n'));
  console.log(
    chalk.bgBlueBright(' setup-webos '),
    chalk.dim('Add, remove or edit WebOS devices')
  );
  console.log(
    chalk.bgBlueBright(' run-webos <device> '),
    chalk.dim('Build and runs webos on device (default device: simulator)')
  );
  console.log(
    chalk.bgBlueBright(' get-key-webos <device>'),
    chalk.dim('Get the key file from the WebOS device')
  );

  console.log(
    chalk.dim(`\nFriendly Guide to React-TV for WebOS:
https://medium.com/@raphamorim/developing-for-tvs-with-react-tv-b5b5204964ef`)
  );
}

function createReactTVApp(appName) {
  let appPath = process.cwd();

  const packageJson = path.resolve(appPath, 'package.json');
  const appTemplatePath = path.resolve(__dirname, '../bootstrap/react-tv');
  const customApp = path.resolve(__dirname, '../bootstrap/custom-app/');

  if (appName) {
    appPath = `${appPath}/${appName}`;
    try {
      fs.copySync(customApp, path.resolve(appPath));
      fs.copySync(appTemplatePath, path.resolve(appPath, 'react-tv'));
      replace({
        regex: '{{REACTTVAPP}}',
        replacement: appName,
        paths: [appName],
        recursive: true,
        silent: true,
      });
    } catch (e) {
      return process.exit(1);
    }

    debug('Done! 📺  ⭐');
    return process.exit(0);
  }

  if (fs.existsSync(packageJson)) {
    appName = require(packageJson).name;
  } else {
    debug('package.json not founded');
    return process.exit(1);
  }

  if (!appName) {
    debug('package.json {name} property not exists');
    return process.exit(1);
  }

  appPath = `${appPath}/react-tv`;
  try {
    fs.copySync(appTemplatePath, appPath);
    replace({
      regex: '{{REACTTVAPP}}',
      replacement: appName,
      paths: ['./react-tv'],
      recursive: true,
      silent: true,
    });
  } catch (e) {
    return process.exit(1);
  }

  debug('Done! 📺  ⭐');
  process.exit(0);
}

module.exports = {
  createReactTVApp: createReactTVApp,
  version: version,
  help: help,
};
