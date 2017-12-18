/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import EventListener from 'fbjs/lib/EventListener';
// import getEventTarget from './getEventTarget';

/**
 * Traps top-level events by using event bubbling.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @param {string} handlerBaseName Event name (e.g. "click").
 * @param {object} element Element on which to attach listener.
 * @return {?object} An object with a remove function which will forcefully
 *                  remove the listener.
 * facebook @internal
 */

export function trapBubbledEvent(
  topLevelType,
  handlerBaseName,
  element,
  handler
) {
  if (!element) {
    return null;
  }
  return EventListener.listen(
    element,
    handlerBaseName,
    handler
    // dispatchEvent.bind(null, topLevelType)
  );
}

/**
 * Traps a top-level event by using event capturing.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @param {string} handlerBaseName Event name (e.g. "click").
 * @param {object} element Element on which to attach listener.
 * @return {?object} An object with a remove function which will forcefully
 *                  remove the listener.
 * facebook @internal
 */
export function trapCapturedEvent(
  topLevelType,
  handlerBaseName,
  element,
  handler
) {
  if (!element) {
    return null;
  }
  return EventListener.capture(
    element,
    handlerBaseName,
    handler
    // dispatchEvent.bind(null, topLevelType)
  );
}

// TODO: Create a Dispacth Event System
export function dispatchEvent(topLevelType, nativeEvent, handlerEvent) {
  // const nativeEventTarget = getEventTarget(nativeEvent);

  try {
    // Event queue being processed in the same cycle allows
    // `preventDefault`.
    // handleTopLevelImpl(nativeEvent);
    console.log(topLevelType, nativeEvent);
  } finally {
    // noop
  }
}
