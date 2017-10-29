/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

module.exports = {
  Platform: {
    webos: window && window.PalmSystem ? true : false,
    tizen: false,
    orsay: false,
  },
};
