/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Navigation from './Navigation';

let initialized = null;

export default function() {
  if (initialized) {
    return;
  }

  Navigation.init();
  Navigation.config({selector: '[react-tv-focusable="true"]'});
  Navigation.focusableElements();
  Navigation.focus();

  initialized = true;
}
