/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import ReactTVRenderer from './renderer/ReactTVFiberEntry';

const ReactTV = {
  render: ReactTVRenderer.render,
  unmountComponentAtNode: ReactTVRenderer.unmountComponentAtNode,
};

export {default as Platform} from './modules/Platform';
export default ReactTV;
