const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

function defaultCLIEnv() {
  //return '/opt/tizen/tools/ide/bin';
  return 'E:/Ferramentas/tizen/tools/ide/bin';
}

function getPackageId(root) {
  const appinfo = path.resolve(root, 'react-tv/tizen/config.xml');
  const content = fs.readFileSync(appinfo, {encoding: 'utf-8'});

  const re = new RegExp(/tizen:application id="(.*?)"/);
  const matches = content.match(re);

  if (!matches) {
    return null;
  }

  return matches[1];
}

function isReactTVTizenProject(root) {
  const appinfo = path.resolve(root, 'react-tv/tizen/config.xml');
  if (fs.existsSync(appinfo)) {
    return true;
  }
  return false;
}

function run(root) {
  let tizen_CLI_ENV = process.env.TIZEN_CLI || false;
  if (!tizen_CLI_ENV) {
    tizen_CLI_ENV = defaultCLIEnv();
  }

  process.env.PATH = `${tizen_CLI_ENV}:${process.env.PATH}`;

  if (!isReactTVTizenProject(root)) {
    const msg = `This project isn\'t a React-TV Tizen Project:
        Just run "react-tv init"`;
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

  // TODO: option to create/select profiles?
  const securityProfiles = execSync(
    `${tizen_CLI_ENV}/tizen security-profiles list`
  )
    .toString()
    .trim()
    .split('\n');
  if (!securityProfiles) {
    return console.log(
      chalk.dim('[react-tv]'),
      'No tizen security profiles found'
    );
  }

  // Select the last profile
  const selectedProfile = securityProfiles[securityProfiles.length - 1]
    .split(' ', 1)[0]
    .trim();

  const tizenPath = path.resolve(root, 'react-tv/tizen');

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGUSR1', cleanup);
  process.on('SIGUSR2', cleanup);
  process.on('uncaughtException', cleanup);

  function cleanup() {
    fs.removeSync(`${tizenPath}/icon.png`);
    ReactTVConfig.files.forEach(file => {
      fs.removeSync(`${tizenPath}/${file}`);
    });
  }

  try {
    cleanup();
    fs.copySync(`${root}/react-tv/icon-large.png`, `${tizenPath}/icon.png`);

    ReactTVConfig.files.forEach(file => {
      const filePath = path.resolve(root, file);
      const toFile = path.resolve(tizenPath, file);
      fs.ensureDirSync(path.dirname(toFile));
      fs.copySync(`${filePath}`, `${toFile}`);
    });
  } catch (e) {
    return console.log('FAIL TO MOUNT', e.toString());
  }

  console.log('');
  console.log(chalk.dim('Setting up Emulator...'));

  const vms = execSync(
    `${tizen_CLI_ENV}/../../emulator/bin/em-cli list-vm`
  ).toString();

  if (vms.indexOf('react-tv-tizen') < 0) {
    execSync(
      `${
        tizen_CLI_ENV
      }/../../emulator/bin/em-cli create -n react-tv-tizen -p tv-samsung-3.0-x86`
    );
  }

  const runningVms = execSync(`${tizen_CLI_ENV}/../../sdb devices`).toString();

  if (runningVms.indexOf('react-tv-tizen') < 0) {
    console.log(chalk.dim('Running Emulator...'));
    execSync(
      `${tizen_CLI_ENV}/../../emulator/bin/em-cli launch -n react-tv-tizen`
    );
    console.log(chalk.yellow(' Tizen Emulator successful running'));
  } else {
    console.log(chalk.yellow(' already running.'));
  }

  console.log(chalk.dim('Packing...'));
  execSync(
    `cd ${tizenPath} && ${tizen_CLI_ENV}/tizen package -t wgt -s ${
      selectedProfile
    }`
  );
  console.log(chalk.yellow(` succefull pack from ${root}`));

  console.log(chalk.dim('Running App...'));

  let attemps = 0;
  const task = setInterval(function() {
    if (attemps > 15) {
      console.log('FAILED TO UP Tizen emulator');
      clearInterval(task);
    }

    try {
      execSync(`${tizen_CLI_ENV}/../../sdb devices`).toString();

      execSync(
        `cd ${tizenPath} && ${tizen_CLI_ENV}/tizen install -n ${
          packageJson.name
        }.wgt -t react-tv-tizen`
      );
    } catch (error) {
      if (error.stdout.toString().indexOf('install completed') < 0) {
        attemps += 1;
        return false;
      }
    }

    clearInterval(task);

    const packageId = getPackageId(root);

    if (!packageId) {
      return console.log('Invalid package id!');
    }

    execSync(
      `cd ${tizenPath} && ${tizen_CLI_ENV}/tizen run -p ${
        packageId
      } -t react-tv-tizen`
    );
  }, 500);
}

module.exports = run;
