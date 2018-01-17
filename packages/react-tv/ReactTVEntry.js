/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import ReactTVRenderer from './renderer/ReactTVFiberEntry';
import Platform from './modules/Platform';
import renderOnAppLoaded from './modules/renderOnAppLoaded';

const ReactTV = {
  render: ReactTVRenderer.render,
  findDOMNode: ReactTVRenderer.findDOMNode,
  unmountComponentAtNode: ReactTVRenderer.unmountComponentAtNode,
  renderOnAppLoaded: renderOnAppLoaded,
  Platform: Platform,
};

module.exports = ReactTV.default ? ReactTV.default : ReactTV;
