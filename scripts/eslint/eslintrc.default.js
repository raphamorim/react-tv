/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const eslintrc = require('../../.eslintrc');

const ERROR = 2;

module.exports = Object.assign({}, eslintrc, {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  rules: Object.assign({}, eslintrc.rules, {
    'no-var': ERROR,
  }),
});
