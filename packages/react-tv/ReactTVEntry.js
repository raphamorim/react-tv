/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import ReactTVRenderer from './renderer/ReactTVFiberEntry';
import PlatformModule from './modules/Platform';
import renderOnAppLoadedModule from './modules/renderOnAppLoaded';

export const render = ReactTVRenderer.render;
export const findDOMNode = ReactTVRenderer.findDOMNode;
export const unmountComponentAtNode = ReactTVRenderer.unmountComponentAtNode;
export const renderOnAppLoaded = renderOnAppLoadedModule;
export const Platform = PlatformModule;

export default ReactTVRenderer;
