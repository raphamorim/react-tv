const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const replace = require('replace');

const debug = function _debug(msg) {
  console.log(chalk.dim('[react-tv]'), msg);
};

const help = function _help() {
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
    chalk.bgGreenBright(' run-webos-dev '),
    chalk.greenBright(' run webos in developer mode on browser')
  );
  console.log(
    chalk.bgRed(' help '),
    chalk.red('          output react-tv cli commands')
  );
};

const createReactTVApp = function _createReactTVApp(appName, appPath) {
  let projectPath = path.resolve(appPath, appName);
  let appTemplatePath = path.resolve(__dirname, '../generators/app');

  return new Promise((fulfill, reject) => {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath);
    } else {
      debug(projectPath + ' already exists');
      return fulfill();
    }

    fs
      .copy(appTemplatePath, projectPath)
      .then(() => {
        replace({
          regex: 'react-tv-app',
          replacement: appName,
          paths: [projectPath],
          recursive: true,
          silent: true,
        });

        debug(appName + ' created');
      })
      .catch(err => reject(debug(err)));
  });
};

module.exports = {
  createReactTVApp: createReactTVApp,
  help: help,
  debug: debug,
};
