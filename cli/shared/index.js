const chalk = require('chalk');

const debug = function _debug(msg) {
  console.log(chalk.dim('[react-tv]'), msg);
}

const help = function _help() {
  console.log('');
  console.log(chalk.bgYellow(' init '),
    chalk.yellow('          init react-tv project'));
  console.log(chalk.bgBlueBright(' run-webos '),
    chalk.blueBright('     pack, build and runs webos simulator'));
  console.log(chalk.bgGreenBright(' run-webos-dev '),
    chalk.greenBright(' run webos in developer mode on browser'));
  console.log(chalk.bgRed(' help '),
    chalk.red('          output react-tv cli commands'));
}

const createProject = function _createProject(projectName, path, callback) {
  return new Promise((fulfill, reject) => {

  })
}

module.exports = {
  createProject: createProject,
  help: help,
  debug: debug,
}
