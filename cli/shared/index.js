const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const replace = require('node-replace');

function debug(msg) {
  console.log(chalk.dim('[react-tv]'), msg);
}

function help() {
  console.log('');
  console.log(
    chalk.bgYellow(' init '),
    chalk.yellow('          init or sync react-tv project')
  );
  console.log(
    chalk.bgBlueBright(' run-webos '),
    chalk.blueBright('     pack, build and runs webos simulator')
  );
  console.log(
    chalk.bgRed(' help '),
    chalk.red('          output react-tv cli commands')
  );
}

function createReactTVApp(appName) {
  let appPath = process.cwd();
  const packageJson = path.resolve(appPath, 'package.json');
  const appTemplatePath = path.resolve(__dirname, '../bootstrap/react-tv');
  const customApp = path.resolve(__dirname, '../bootstrap/custom-app/');

  if (appName) {
    appPath = `${appPath}/${appName}`;
    fs.copySync(customApp, path.resolve(appPath));
    replace({
      regex: '{{REACTTVAPP}}',
      replacement: appName,
      paths: [appName],
      recursive: true,
      silent: true,
    });

    debug('Done! 📺  ⭐');
    return;
  }

  if (fs.existsSync(packageJson)) {
    existentProject = true;
    appName = require(packageJson).name;
  } else {
    return debug('package.json not founded');
  }

  if (!appName) {
    return debug('package.json {name} property not exists');
  }

  appPath = `${appPath}/react-tv`;
  fs.copySync(appTemplatePath, appPath);
  replace({
    regex: '{{REACTTVAPP}}',
    replacement: appName,
    paths: ['./react-tv'],
    recursive: true,
    silent: true,
  });

  debug('Done! 📺  ⭐');
}

module.exports = {
  createReactTVApp: createReactTVApp,
  help: help,
  debug: debug,
};
