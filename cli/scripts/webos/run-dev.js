const express = require('express'),
  path = require('path'),
  chalk = require('chalk')
  app = express(),
  port = process.env['REACT_TV_PORT'] || 8500,
  hostname = '0.0.0.0'

module.exports = function(pathArg) {
  const pathWebOS = path.resolve(pathArg, 'webos')

  app.use(express.static(pathWebOS))

  app.listen(port, hostname, () =>
    console.info(
      chalk.dim('[react-tv]'),
      `running on ${chalk.yellow(`${hostname}:${port}`)}`
    )
  )
}
