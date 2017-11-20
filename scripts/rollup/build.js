'use strict';

const path = require('path');
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const flow = require('rollup-plugin-flow');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const replace = require('rollup-plugin-replace');
const optimizeJs = require('rollup-plugin-optimize-js');
const chalk = require('chalk');

const REACT_TV_VERSION = require('../../package.json').version;

let tasks = [];

function stripEnvVariables(production) {
  return {
    __DEV__: production ? 'false' : 'true',
    'process.env.NODE_ENV': production ? "'production'" : "'development'",
  };
}

function createBundle({input, bundleType, destName}) {
  input = path.resolve(input);
  const logKey = chalk.white.bold(input) + chalk.dim(` (${REACT_TV_VERSION})`);
  console.log(`${chalk.blue(bundleType)} ${logKey} -> dist/${destName}`);

  let plugins = [
    flow(),
    replace(stripEnvVariables()),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      externalHelpers: true,
      presets: [['env', {modules: false}], 'react', 'stage-2'],
      plugins: ['transform-flow-strip-types', 'external-helpers'],
    }),
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ];

  if (bundleType.indexOf('PROD') >= 0) {
    plugins = plugins.concat([optimizeJs(), uglify()]);
  }

  rollup({
    input,
    plugins,
    sourcemap: false,
  }).then(bundle => {
    tasks.push(
      bundle.write({
        format: bundleType === 'PROD-UMD' ? 'umd' : 'iife',
        name: 'ReactTV',
        file: `dist/${destName}`,
      })
    );
  });
}

createBundle({
  input: 'src/ReactTVEntry.js',
  bundleType: 'DEV',
  destName: 'react-tv.js',
});

if (process.env['NODE_ENV'] === 'PROD') {
  createBundle({
    input: 'src/ReactTVEntry.js',
    bundleType: 'PROD',
    destName: 'react-tv.min.js',
  });

  createBundle({
    input: 'src/ReactTVEntry.js',
    bundleType: 'PROD-UMD',
    destName: 'react-tv.umd.js',
  });
}

Promise.all(tasks).catch(error => {
  Promise.reject(error);
});
