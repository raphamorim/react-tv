const path = require('path');
const chalk = require('chalk');
const {exec, execSync, spawnSync} = require('child_process');
const {getCLIEnv} = require('./shared');

function getKey(device) {
  if (!device) {
    const msg = `You need to specify <device>`;
    return console.log(chalk.dim('[react-tv]'), msg);
  }

  let webOS_TV_SDK_ENV = process.env.WEBOS_CLI_TV || false;
  if (!webOS_TV_SDK_ENV) {
    webOS_TV_SDK_ENV = getCLIEnv();
  }

  process.env.PATH = `${webOS_TV_SDK_ENV}:${process.env.PATH}`;

  spawnSync(
    `${webOS_TV_SDK_ENV}/ares-novacom`,
    [`--device ${device} --getkey`],
    {
      stdio: 'inherit',
      shell: true,
      encoding: 'utf8',
    }
  );
}

module.exports = getKey;
