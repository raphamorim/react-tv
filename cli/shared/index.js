const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const replace = require('node-replace');

const debug = function(msg) {
  console.log(chalk.dim('[react-tv]'), msg);
};

const help = function() {
  console.log('');
  console.log(
    chalk.bgYellow(' init '),
    chalk.yellow('          init react-tv project')
  );
  console.log(
    chalk.bgBlueBright(' run-webos '),
    chalk.blueBright('     pack, build and runs webos simulator')
  );
  console.log(
    chalk.bgRed(' help '),
    chalk.red('          output react-tv cli commands')
  );
};

const createReactTVApp = function(appName, appPath) {
  const packageJson = path.resolve(appPath, 'package.json');
  if (fs.existsSync(packageJson)) {
    existentProject = true;
    appName = require(packageJson).name;
  } else {
    return debug('package.json not founded');
  }

  if (!appName) {
    return debug('package.json {name} property not exists');
  }

  let appTemplatePath = path.resolve(__dirname, '../generators/app');
  return new Promise((fulfill, reject) => {
    fs
      .copy(appTemplatePath, appPath)
      .then(() => {
        replace({
          regex: '{{REACTTVAPP}}',
          replacement: appName,
          paths: ['./react-tv'],
          recursive: true,
          silent: true,
        });

        debug('Done! 📺  ⭐');
      })
      .catch(err => reject(debug(err)));
  });
};

module.exports = {
  createReactTVApp: createReactTVApp,
  help: help,
  debug: debug,
};
