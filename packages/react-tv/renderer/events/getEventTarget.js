/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TEXT_NODE} from '../shared/HTMLNodeType';

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  let target = nativeEvent.target || nativeEvent.srcElement || window;

  // Normalize SVG <use> element events facebook/react#4963
  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}

export default getEventTarget;
