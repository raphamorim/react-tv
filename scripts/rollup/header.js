'use strict';

function getProvidesHeader(hasteFinalName) {
  return `/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @providesModule ${hasteFinalName}
 * @preventMunge
 */
`;
}

function getHeader(filename, version) {
  return `/** @license React-TV v${reactVersion}
 * ${filename}
 *
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;
}

module.exports = {
  getProvidesHeader,
  getHeader,
};
