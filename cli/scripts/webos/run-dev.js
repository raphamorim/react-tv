const express = require('express'),
  path = require('path'),
  build = require('../build'),
  chalk = require('chalk'),
  app = express(),
  port = process.env['REACT_TV_PORT'] || 8500,
  hostname = '0.0.0.0';

module.exports = function _runWebOSDev(pathArg) {
  const pathWebOS = path.resolve(pathArg, 'webos');

  // build(pathArg, pathWebOS);

  app.use(express.static(pathWebOS));

  app.listen(port, hostname, () =>
    console.info(
      chalk.dim('[react-tv]'),
      `running on ${chalk.yellow(`${hostname}:${port}`)}`
    )
  );
};
