require('babel-register')({});

const assert = require('assert');
const React = require('react');
const { purgeCache } = require('../shared');

console.log('Running Platform tests from %s', __dirname);

const ok = [];
const fail = [];
const skipped = [];
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[37m',
};

const it = (desc, fn) => {
  try {
    fn.call(null);
    console.log('%s✓ %s%s', colors.green, colors.reset, desc);
    ok.push({desc});
  } catch (err) {
    fail.push({desc, err});
    console.log('%s𝘅 %s%s',colors.red, colors.reset,  desc);
    console.error('%s. Expected\n  %j\n to equal\n  %j\n', err.name, err.actual, err.expected)
  }
};

it.skip = (desc, fn) => skipped.push({desc});

it('[nodejs] should return false for every Platform', () => {
  purgeCache('../../src');

  // mock window
  global.window = {};

  // force parse Platform for every iteration
  const { Platform } = require('../../src');

  assert.deepEqual(Platform.webos, false);
  assert.deepEqual(Platform.orsay, false);
  assert.deepEqual(Platform.tizen, false);

  global.window = null;
});

it('[webos] should return true only for webos', () => {
  purgeCache('../../src');

  global.window = { PalmSystem: {version: 1} };

  // force parse Platform for every iteration
  const { Platform } = require('../../src');

  assert.deepEqual(Platform.webos, true);
  assert.deepEqual(Platform.orsay, false);
  assert.deepEqual(Platform.tizen, false);

  global.window = null;
});

if (fail.length > 0) {
  console.log('%s tests passed', ok.length);
  if (skipped.length) console.log('%s tests skipped', skipped.length);
  console.log('%s tests failed', fail.length);
  process.exit(1);
} else {
  console.log('%s tests passed', ok.length);
  if (skipped.length) console.log('%s tests skipped', skipped.length);
}

console.log('');
