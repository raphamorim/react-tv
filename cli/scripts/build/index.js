function Build(rootPath, pathWebOS) {
  const fs = require('fs');
  const path = require('path');
  const chalk = require('chalk');
  const {execSync} = require('child_process');

  let crowBinPath = path.resolve(
    __dirname,
    '../../../node_modules/crow-scripts/bin/crow-scripts.js'
  );

  console.info(chalk.dim('[react-tv]'), `bundling...`);

  execSync(
    `cd ${rootPath} && node ${
      crowBinPath
    } webpack --enable-loose --disable-css --disable-manifest --target-browsers webos/bundle/app src`
  );
  execSync(
    `cd ${pathWebOS}/bundle && mv app.*.js app.js && mv app.*.js.map app.js.map`
  );
}

module.exports = Build;
