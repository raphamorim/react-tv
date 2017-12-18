/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Borrowed from https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactBrowserEventEmitter.js
 */

import {trapBubbledEvent, trapCapturedEvent} from './ReactTVEventListener';

import EventConstants from './EventConstants';

let alreadyListeningTo = {};
let reactTopListenersCounter = 0;

/**
 * To ensure no conflicts with other potential React instances on the page
 */
let topListenersIDKey = '_reactListenersID' + ('' + Math.random()).slice(2);

function getListeningForDocument(mountAt) {
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}

/**
 * We listen for bubbled touch events on the document object.
 *
 * Firefox v8.01 (and possibly others) exhibited strange behavior when
 * mounting `onmousemove` events at some node that was not the document
 * element. The symptoms were that if your mouse is not moving over something
 * contained within that mount point (for example on the background) the
 * top-level listeners for `onmousemove` won't be called. However, if you
 * register the `mousemove` on the document object, then it will of course
 * catch all `mousemove`s. This along with iOS quirks, justifies restricting
 * top-level listeners to the document object only, at least for these
 * movement types of events and possibly all events.
 *
 * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
 *
 * @param {string} registrationName Name of listener (e.g. `onClick`).
 * @param {object} contentDocumentHandle Document which owns the container
 */
export function listenTo(registrationName, mountAt, handler) {
  const isListening = getListeningForDocument(mountAt);
  let dependency = EventConstants[registrationName];

  if (
    !(
      isListening.hasOwnProperty(registrationName) &&
      isListening[registrationName]
    )
  ) {
    if (registrationName === 'onScroll') {
      trapCapturedEvent('onScroll', 'scroll', mountAt, handler);
    } else if (
      registrationName === 'onFocus' ||
      registrationName === 'onBlur'
    ) {
      if (registrationName === 'onFocus') {
        trapCapturedEvent('onFocus', 'focus', mountAt, handler);
      } else {
        trapCapturedEvent('onBlur', 'blur', mountAt, handler);
      }

      // to make sure blur and focus event listeners are only attached once
      isListening.blur = true;
      isListening.focus = true;
    } else if (registrationName === 'onPress') {
      trapCapturedEvent('onPress', 'keypress', mountAt, e => {
        // TODO: Separate this logic
        if (e.keyCode === 13) {
          handler();
        }
      });
    } else if (EventConstants.hasOwnProperty(registrationName)) {
      trapBubbledEvent(registrationName, dependency, mountAt, handler);
    }

    isListening[registrationName] = true;
  }
}

export {trapBubbledEvent, trapCapturedEvent};
