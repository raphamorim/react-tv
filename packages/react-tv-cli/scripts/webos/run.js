const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const {exec, execSync, spawnSync} = require('child_process');
const {getCLIEnv, isReactTVWebOSProject} = require('./shared');

function runEmulator(ENV) {
  const webOSTVVersion = process.env.WEBOS_CLI_TV_VERSION || false;
  const version = webOSTVVersion ? `v${webOSTVVersion}` : 'v3.0.0';
  switch (process.platform) {
    case 'darwin':
      execSync(
        `open ${ENV}/../../Emulator/${version}/LG_webOS_TV_Emulator_RCU.app`
      );
      break;
    case 'linux':
      exec(`
        sh ${ENV}/../../Emulator/${version}/LG_webOS_TV_Emulator.sh
        &&
        java -jar ${ENV}/../../Emulator/${version}/LG_webOS_TV_Emulator_linux_x64.jar -remocon`);
      break;
    case 'win32':
      exec(`LG_webOS_TV_Emulator.bat`, {
        cwd: `${ENV}/../Emulator/${version}/`,
        windowsHide: true,
      });
      break;
    default:
      execSync(
        `open ${ENV}/../../Emulator/${version}/LG_webOS_TV_Emulator_RCU.app`
      );
  }
}

function run(root, device) {
  let webOS_TV_SDK_ENV = process.env.WEBOS_CLI_TV || false;
  let optDevice = '';

  if (!webOS_TV_SDK_ENV) {
    webOS_TV_SDK_ENV = getCLIEnv();
  }

  if (device) {
    optDevice = `--device ${device}`;
  }

  process.env.PATH = `${webOS_TV_SDK_ENV}:${process.env.PATH}`;

  if (!isReactTVWebOSProject(root)) {
    const msg = `This project isn\'t a React-TV WebOS Project:\n> Just run "react-tv init"`;
    return console.log(chalk.dim('[react-tv]'), msg);
  }

  const packageJson = require(path.resolve(root, 'package.json'));
  const ReactTVConfig = packageJson['react-tv'];
  if (!ReactTVConfig) {
    return console.log(
      chalk.dim('[react-tv]'),
      'You should set react-tv properties on package.json'
    );
  }

  if (!ReactTVConfig.files || !ReactTVConfig.files.length) {
    return console.log(chalk.dim('[react-tv]'), 'You should add files');
  }

  const webosPath = path.resolve(root, 'react-tv/webos');

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGUSR1', cleanup);
  process.on('SIGUSR2', cleanup);
  process.on('uncaughtException', cleanup);

  function cleanup() {
    fs.removeSync(`${webosPath}/icon.png`);
    fs.removeSync(`${webosPath}/icon-large.png`);
    ReactTVConfig.files.forEach(file => {
      fs.removeSync(`${webosPath}/${file}`);
    });
  }

  try {
    cleanup();
    fs.copySync(`${root}/react-tv/icon.png`, `${webosPath}/icon.png`);
    fs.copySync(
      `${root}/react-tv/icon-large.png`,
      `${webosPath}/icon-large.png`
    );

    ReactTVConfig.files.forEach(file => {
      const filePath = path.resolve(root, file);
      const toFile = path.resolve(webosPath, file);
      fs.ensureDirSync(path.dirname(toFile));
      fs.copySync(`${filePath}`, `${toFile}`);
    });
  } catch (e) {
    return console.log('FAIL TO MOUNT', e.toString());
  }

  if (!device) {
    console.log('');
    console.log(chalk.dim('Up Emulator...'));

    runEmulator(webOS_TV_SDK_ENV);

    console.log(chalk.yellow(' LG WebOS Emulator 3.0.0 succefull running'));
  }

  let attemps = 0;
  const task = setInterval(function() {
    if (!device) {
      const runningVMS = execSync(`vboxmanage list runningvms`).toString();
      if (attemps > 30) {
        console.log('FAILED TO UP virtualbox emulator');
        clearInterval(task);
      }

      if (runningVMS.indexOf('webOS') < 0) {
        attemps += 1;
        return false;
      }

      console.log(runningVMS);
    } else {
      console.log(chalk.dim('Running on', device));
    }

    clearInterval(task);

    console.log(chalk.dim('Packing...'));

    execSync(`${webOS_TV_SDK_ENV}/ares-package .`, {cwd: webosPath});
    console.log(chalk.yellow(` succefull pack from ${root}`));

    cleanup();

    console.log(chalk.dim('Installing...'));
    const config = JSON.parse(
      fs.readFileSync(`${webosPath}/appinfo.json`).toString()
    );

    const latestIPK = config.id + '_' + config.version + '_all.ipk';
    console.log(chalk.blue(` installing ${latestIPK} as IPK`));
    execSync(`${webOS_TV_SDK_ENV}/ares-install ${optDevice} ${latestIPK}`, {
      cwd: webosPath,
    });
    console.log(chalk.yellow(` succefull install ${config.title}`));

    console.log(chalk.dim('Launching...'));
    execSync(`${webOS_TV_SDK_ENV}/ares-launch ${optDevice} ${config.id}`, {
      cwd: webosPath,
    });
    console.log(chalk.yellow(` launched`));

    console.log(chalk.dim('Inspecting...'));
    spawnSync(
      `${webOS_TV_SDK_ENV}/ares-inspect`,
      [`-a ${config.id} ${optDevice}`],
      {
        stdio: 'inherit',
        shell: true,
        encoding: 'utf8',
      }
    );
  }, 500);
}

module.exports = run;
