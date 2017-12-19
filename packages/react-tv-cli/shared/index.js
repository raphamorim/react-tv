const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const replace = require('node-replace');
const randomstring = require('randomstring');

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
  console.log(
    chalk.bgYellow(' init '),
    chalk.yellow('          init or sync react-tv project')
  );
  console.log(
    chalk.bgBlueBright(' run-webos '),
    chalk.blueBright('     pack, build and runs webos simulator')
  );
  console.log(
    chalk.bgBlueBright(' run-tizen '),
    chalk.blueBright('     pack, build and runs tizen emulator')
  );
  console.log(
    chalk.bgRed(' help '),
    chalk.red('          output react-tv cli commands')
  );
}

function createReactTVApp(appName) {
  console.log('tizen');
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

      replace({
        regex: '{{TIZEN_PACKAGE}}',
        replacement: randomstring.generate(10),
        paths: [appName],
        recursive: true,
        silent: true,
      });

      replace({
        regex: '{{TIZEN_REACTTVAPP}}',
        replacement: appName.replace(/-/g, '').replace(/\./g, ''),
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

    replace({
      regex: '{{TIZEN_PACKAGE}}',
      replacement: randomstring.generate(10),
      paths: ['./react-tv/tizen'],
      recursive: true,
      silent: true,
    });

    replace({
      regex: '{{TIZEN_REACTTVAPP}}',
      replacement: appName.replace(/-/g, '').replace(/\./g, ''),
      paths: ['./react-tv/tizen'],
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
