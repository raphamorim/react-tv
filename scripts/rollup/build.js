'use strict';

const path = require('path');
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const flow = require('rollup-plugin-flow');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const chalk = require('chalk');

const REACT_TV_VERSION = require('../../package.json').version;

const Header = require('./header');
const sizes = require('./plugins/sizes-plugin');

function stripEnvVariables(production) {
  return {
    __DEV__: production ? 'false' : 'true',
    'process.env.NODE_ENV': production ? "'production'" : "'development'",
  };
}

function getBanner(filename, moduleType) {
  return Header.getHeader(filename, REACT_TV_VERSION);
}

function runWaterfall(promiseFactories) {
  if (promiseFactories.length === 0) {
    return Promise.resolve();
  }

  const head = promiseFactories[0];
  const tail = promiseFactories.slice(1);

  const nextPromiseFactory = head;
  const nextPromise = nextPromiseFactory();
  if (!nextPromise || typeof nextPromise.then !== 'function') {
    throw new Error('runWaterfall() received something that is not a Promise.');
  }

  return nextPromise.then(() => {
    return runWaterfall(tail);
  });
}

function createBundle({ entryPath, bundleType }) {
  console.log(`${chalk.bgGreen.white(REACT_TV_VERSION)}`);

  entryPath = path.resolve(entryPath);
  const logKey = chalk.white.bold(entryPath) + chalk.dim(` (${bundleType.toLowerCase()})`);
  console.log(`${chalk.bgYellow.black(' BUILDING ')} ${logKey}`);

  rollup({
    entry: entryPath,
    plugins: [
      flow(),
      babel({
        exclude: 'node_modules/**'
      }),
      commonjs(),
      resolve({
        jsnext: true,
      }),
      replace(stripEnvVariables())
    ]
  }).then(bundle => Promise.all([
    bundle.write({
      banner: getBanner('react-tv.js'),
      format: 'iife',
      moduleName: 'ReactTV',
      sourceMap: 'inline',
      dest: 'build/react-tv.js',
    })
  ])).catch(error => console.log(error));
}

createBundle({
  entryPath: 'src/ReactTVEntry.js',
  bundleType: 'DEV'
});
