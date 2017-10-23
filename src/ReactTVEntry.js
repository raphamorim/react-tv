/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

var reactTVRenderer = require('./renderer/ReactTVFiberEntry');
var modules = require('./modules');

module.exports = {
  render: reactTVRenderer.render,
  Platform: modules.Platform,
};
