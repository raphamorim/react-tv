/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
  Fork from luke-chang/js-spatial-navigation
 */

// TODO: Migrate this logic on ReactRenderer

let GlobalConfig = {
  selector: '',
  straightOnly: false,
  straightOverlapThreshold: 0.5,
  rememberSource: false,
  disabled: false,
  defaultElement: '[focused="true"]',
  enterTo: '',
  leaveFor: null,
  restrict: 'self-first',
  tabIndexIgnoreList:
    'a, input, select, textarea, button, iframe, [contentEditable=true]',
  navigableFilter: null,
};

const KEYMAPPING = {
  '37': 'left',
  '38': 'up',
  '39': 'right',
  '40': 'down',
};

const REVERSE = {
  left: 'right',
  up: 'down',
  right: 'left',
  down: 'up',
};

const EVENT_PREFIX = 'sn:';
const ID_POOL_PREFIX = 'section-';

let _idPool = 0;
let _ready = false;
let _pause = false;
let _sections = {};
let _sectionCount = 0;
let _defaultSectionId = '';
let _lastSectionId = '';
let _duringFocusChange = false;

var elementMatchesSelector =
  Element.prototype.matches ||
  Element.prototype.matchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.msMatchesSelector ||
  Element.prototype.oMatchesSelector ||
  function(selector) {
    var matchedNodes = (this.parentNode || this.document).querySelectorAll(
      selector
    );
    return [].slice.call(matchedNodes).indexOf(this) >= 0;
  };

function getRect(elem) {
  var cr = elem.getBoundingClientRect();
  var rect = {
    left: cr.left,
    top: cr.top,
    right: cr.right,
    bottom: cr.bottom,
    width: cr.width,
    height: cr.height,
  };
  rect.element = elem;
  rect.center = {
    x: rect.left + Math.floor(rect.width / 2),
    y: rect.top + Math.floor(rect.height / 2),
  };
  rect.center.left = rect.center.right = rect.center.x;
  rect.center.top = rect.center.bottom = rect.center.y;
  return rect;
}

function partition(rects, targetRect, straightOverlapThreshold) {
  var groups = [[], [], [], [], [], [], [], [], []];

  for (var i = 0; i < rects.length; i++) {
    var rect = rects[i];
    var center = rect.center;
    var x, y, groupId;

    if (center.x < targetRect.left) {
      x = 0;
    } else if (center.x <= targetRect.right) {
      x = 1;
    } else {
      x = 2;
    }

    if (center.y < targetRect.top) {
      y = 0;
    } else if (center.y <= targetRect.bottom) {
      y = 1;
    } else {
      y = 2;
    }

    groupId = y * 3 + x;
    groups[groupId].push(rect);

    if ([0, 2, 6, 8].indexOf(groupId) !== -1) {
      var threshold = straightOverlapThreshold;

      if (rect.left <= targetRect.right - targetRect.width * threshold) {
        if (groupId === 2) {
          groups[1].push(rect);
        } else if (groupId === 8) {
          groups[7].push(rect);
        }
      }

      if (rect.right >= targetRect.left + targetRect.width * threshold) {
        if (groupId === 0) {
          groups[1].push(rect);
        } else if (groupId === 6) {
          groups[7].push(rect);
        }
      }

      if (rect.top <= targetRect.bottom - targetRect.height * threshold) {
        if (groupId === 6) {
          groups[3].push(rect);
        } else if (groupId === 8) {
          groups[5].push(rect);
        }
      }

      if (rect.bottom >= targetRect.top + targetRect.height * threshold) {
        if (groupId === 0) {
          groups[3].push(rect);
        } else if (groupId === 2) {
          groups[5].push(rect);
        }
      }
    }
  }

  return groups;
}

function generateDistanceFunction(targetRect) {
  return {
    nearPlumbLineIsBetter: function(rect) {
      var d;
      if (rect.center.x < targetRect.center.x) {
        d = targetRect.center.x - rect.right;
      } else {
        d = rect.left - targetRect.center.x;
      }
      return d < 0 ? 0 : d;
    },
    nearHorizonIsBetter: function(rect) {
      var d;
      if (rect.center.y < targetRect.center.y) {
        d = targetRect.center.y - rect.bottom;
      } else {
        d = rect.top - targetRect.center.y;
      }
      return d < 0 ? 0 : d;
    },
    nearTargetLeftIsBetter: function(rect) {
      var d;
      if (rect.center.x < targetRect.center.x) {
        d = targetRect.left - rect.right;
      } else {
        d = rect.left - targetRect.left;
      }
      return d < 0 ? 0 : d;
    },
    nearTargetTopIsBetter: function(rect) {
      var d;
      if (rect.center.y < targetRect.center.y) {
        d = targetRect.top - rect.bottom;
      } else {
        d = rect.top - targetRect.top;
      }
      return d < 0 ? 0 : d;
    },
    topIsBetter: function(rect) {
      return rect.top;
    },
    bottomIsBetter: function(rect) {
      return -1 * rect.bottom;
    },
    leftIsBetter: function(rect) {
      return rect.left;
    },
    rightIsBetter: function(rect) {
      return -1 * rect.right;
    },
  };
}

function prioritize(priorities) {
  var destPriority = null;
  for (var i = 0; i < priorities.length; i++) {
    if (priorities[i].group.length) {
      destPriority = priorities[i];
      break;
    }
  }

  if (!destPriority) {
    return null;
  }

  var destDistance = destPriority.distance;

  destPriority.group.sort(function(a, b) {
    for (var i = 0; i < destDistance.length; i++) {
      var distance = destDistance[i];
      var delta = distance(a) - distance(b);
      if (delta) {
        return delta;
      }
    }
    return 0;
  });

  return destPriority.group;
}

function navigate(target, direction, candidates, config) {
  if (!target || !direction || !candidates || !candidates.length) {
    return null;
  }

  var rects = [];
  for (var i = 0; i < candidates.length; i++) {
    var rect = getRect(candidates[i]);
    if (rect) {
      rects.push(rect);
    }
  }
  if (!rects.length) {
    return null;
  }

  var targetRect = getRect(target);
  if (!targetRect) {
    return null;
  }

  var distanceFunction = generateDistanceFunction(targetRect);

  var groups = partition(rects, targetRect, config.straightOverlapThreshold);

  var internalGroups = partition(
    groups[4],
    targetRect.center,
    config.straightOverlapThreshold
  );

  var priorities;

  switch (direction) {
    case 'left':
      priorities = [
        {
          group: internalGroups[0]
            .concat(internalGroups[3])
            .concat(internalGroups[6]),
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
          ],
        },
        {
          group: groups[3],
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
          ],
        },
        {
          group: groups[0].concat(groups[6]),
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.rightIsBetter,
            distanceFunction.nearTargetTopIsBetter,
          ],
        },
      ];
      break;
    case 'right':
      priorities = [
        {
          group: internalGroups[2]
            .concat(internalGroups[5])
            .concat(internalGroups[8]),
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
          ],
        },
        {
          group: groups[5],
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
          ],
        },
        {
          group: groups[2].concat(groups[8]),
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
            distanceFunction.nearTargetTopIsBetter,
          ],
        },
      ];
      break;
    case 'up':
      priorities = [
        {
          group: internalGroups[0]
            .concat(internalGroups[1])
            .concat(internalGroups[2]),
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
          ],
        },
        {
          group: groups[1],
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
          ],
        },
        {
          group: groups[0].concat(groups[2]),
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.bottomIsBetter,
            distanceFunction.nearTargetLeftIsBetter,
          ],
        },
      ];
      break;
    case 'down':
      priorities = [
        {
          group: internalGroups[6]
            .concat(internalGroups[7])
            .concat(internalGroups[8]),
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
          ],
        },
        {
          group: groups[7],
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
          ],
        },
        {
          group: groups[6].concat(groups[8]),
          distance: [
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
            distanceFunction.nearTargetLeftIsBetter,
          ],
        },
      ];
      break;
    default:
      return null;
  }

  if (config.straightOnly) {
    priorities.pop();
  }

  var destGroup = prioritize(priorities);
  if (!destGroup) {
    return null;
  }

  var dest = null;
  if (
    config.rememberSource &&
    config.previous &&
    config.previous.destination === target &&
    config.previous.reverse === direction
  ) {
    for (var j = 0; j < destGroup.length; j++) {
      if (destGroup[j].element === config.previous.target) {
        dest = destGroup[j].element;
        break;
      }
    }
  }

  if (!dest) {
    dest = destGroup[0].element;
  }

  return dest;
}

function generateId() {
  var id;
  while (true) {
    id = ID_POOL_PREFIX + String(++_idPool);
    if (!_sections[id]) {
      break;
    }
  }
  return id;
}

function parseSelector(selector) {
  var result;
  if (typeof selector === 'string') {
    result = [].slice.call(document.querySelectorAll(selector));
  } else if (typeof selector === 'object' && selector.length) {
    result = [].slice.call(selector);
  } else if (typeof selector === 'object' && selector.nodeType === 1) {
    result = [selector];
  } else {
    result = [];
  }
  return result;
}

function matchSelector(elem, selector) {
  if (typeof selector === 'string') {
    return elementMatchesSelector.call(elem, selector);
  } else if (typeof selector === 'object' && selector.length) {
    return selector.indexOf(elem) >= 0;
  } else if (typeof selector === 'object' && selector.nodeType === 1) {
    return elem === selector;
  }
  return false;
}

function getCurrentFocusedElement() {
  var activeElement = document.activeElement;
  if (activeElement && activeElement !== document.body) {
    return activeElement;
  }
}

function extend(out) {
  out = out || {};
  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      continue;
    }
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key) && arguments[i][key] !== undefined) {
        out[key] = arguments[i][key];
      }
    }
  }
  return out;
}

function exclude(elemList, excludedElem) {
  if (!Array.isArray(excludedElem)) {
    excludedElem = [excludedElem];
  }
  for (var i = 0, index; i < excludedElem.length; i++) {
    index = elemList.indexOf(excludedElem[i]);
    if (index >= 0) {
      elemList.splice(index, 1);
    }
  }
  return elemList;
}

function isNavigable(elem, sectionId, verifySectionSelector) {
  if (
    !elem ||
    !sectionId ||
    !_sections[sectionId] ||
    _sections[sectionId].disabled
  ) {
    return false;
  }
  if (
    (elem.offsetWidth <= 0 && elem.offsetHeight <= 0) ||
    elem.hasAttribute('disabled')
  ) {
    return false;
  }
  if (
    verifySectionSelector &&
    !matchSelector(elem, _sections[sectionId].selector)
  ) {
    return false;
  }
  if (typeof _sections[sectionId].navigableFilter === 'function') {
    if (_sections[sectionId].navigableFilter(elem, sectionId) === false) {
      return false;
    }
  } else if (typeof GlobalConfig.navigableFilter === 'function') {
    if (GlobalConfig.navigableFilter(elem, sectionId) === false) {
      return false;
    }
  }
  return true;
}

function getSectionId(elem) {
  for (var id in _sections) {
    if (
      !_sections[id].disabled &&
      matchSelector(elem, _sections[id].selector)
    ) {
      return id;
    }
  }
}

function getSectionNavigableElements(sectionId) {
  return parseSelector(_sections[sectionId].selector).filter(function(elem) {
    return isNavigable(elem, sectionId);
  });
}

function getSectionDefaultElement(sectionId) {
  var defaultElement = _sections[sectionId].defaultElement;
  if (!defaultElement) {
    return null;
  }
  if (typeof defaultElement === 'string') {
    defaultElement = parseSelector(defaultElement)[0];
  }
  if (isNavigable(defaultElement, sectionId, true)) {
    return defaultElement;
  }
  return null;
}

function getSectionLastFocusedElement(sectionId) {
  var lastFocusedElement = _sections[sectionId].lastFocusedElement;
  if (!isNavigable(lastFocusedElement, sectionId, true)) {
    return null;
  }
  return lastFocusedElement;
}

function fireEvent(elem, type, details, cancelable) {
  if (arguments.length < 4) {
    cancelable = true;
  }
  var evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(EVENT_PREFIX + type, true, cancelable, details);
  return elem.dispatchEvent(evt);
}

function focusElement(elem, sectionId, direction) {
  if (!elem) {
    return false;
  }

  var currentFocusedElement = getCurrentFocusedElement();

  var silentFocus = function() {
    if (currentFocusedElement) {
      currentFocusedElement.blur();
    }
    elem.focus();
    focusChanged(elem, sectionId);
  };

  if (_duringFocusChange) {
    silentFocus();
    return true;
  }

  _duringFocusChange = true;

  if (_pause) {
    silentFocus();
    _duringFocusChange = false;
    return true;
  }

  if (currentFocusedElement) {
    var unfocusProperties = {
      nextElement: elem,
      nextSectionId: sectionId,
      direction: direction,
      native: false,
    };
    if (!fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
      _duringFocusChange = false;
      return false;
    }
    currentFocusedElement.blur();
    fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false);
  }

  var focusProperties = {
    previousElement: currentFocusedElement,
    sectionId: sectionId,
    direction: direction,
    native: false,
  };
  if (!fireEvent(elem, 'willfocus', focusProperties)) {
    _duringFocusChange = false;
    return false;
  }
  elem.focus();
  fireEvent(elem, 'focused', focusProperties, false);

  _duringFocusChange = false;

  focusChanged(elem, sectionId);
  return true;
}

function focusChanged(elem, sectionId) {
  if (!sectionId) {
    sectionId = getSectionId(elem);
  }
  if (sectionId) {
    _sections[sectionId].lastFocusedElement = elem;
    _lastSectionId = sectionId;
  }
}

function focusExtendedSelector(selector, direction) {
  if (selector.charAt(0) == '@') {
    if (selector.length == 1) {
      return focusSection();
    } else {
      var sectionId = selector.substr(1);
      return focusSection(sectionId);
    }
  } else {
    var next = parseSelector(selector)[0];
    if (next) {
      var nextSectionId = getSectionId(next);
      if (isNavigable(next, nextSectionId)) {
        return focusElement(next, nextSectionId, direction);
      }
    }
  }
  return false;
}

function focusSection(sectionId) {
  var range = [];
  var addRange = function(id) {
    if (
      id &&
      range.indexOf(id) < 0 &&
      _sections[id] &&
      !_sections[id].disabled
    ) {
      range.push(id);
    }
  };

  if (sectionId) {
    addRange(sectionId);
  } else {
    addRange(_defaultSectionId);
    addRange(_lastSectionId);
    Object.keys(_sections).map(addRange);
  }

  for (var i = 0; i < range.length; i++) {
    var id = range[i];
    var next;

    if (_sections[id].enterTo == 'last-focused') {
      next =
        getSectionLastFocusedElement(id) ||
        getSectionDefaultElement(id) ||
        getSectionNavigableElements(id)[0];
    } else {
      next =
        getSectionDefaultElement(id) ||
        getSectionLastFocusedElement(id) ||
        getSectionNavigableElements(id)[0];
    }

    if (next) {
      return focusElement(next, id);
    }
  }

  return false;
}

function fireNavigatefailed(elem, direction) {
  fireEvent(
    elem,
    'navigatefailed',
    {
      direction: direction,
    },
    false
  );
}

function gotoLeaveFor(sectionId, direction) {
  if (
    _sections[sectionId].leaveFor &&
    _sections[sectionId].leaveFor[direction] !== undefined
  ) {
    var next = _sections[sectionId].leaveFor[direction];

    if (typeof next === 'string') {
      if (next === '') {
        return null;
      }
      return focusExtendedSelector(next, direction);
    }

    var nextSectionId = getSectionId(next);
    if (isNavigable(next, nextSectionId)) {
      return focusElement(next, nextSectionId, direction);
    }
  }
  return false;
}

function focusNext(direction, currentFocusedElement, currentSectionId) {
  var extSelector = currentFocusedElement.getAttribute('data-sn-' + direction);
  if (typeof extSelector === 'string') {
    if (extSelector === '' || !focusExtendedSelector(extSelector, direction)) {
      fireNavigatefailed(currentFocusedElement, direction);
      return false;
    }
    return true;
  }

  var sectionNavigableElements = {};
  var allNavigableElements = [];
  for (var id in _sections) {
    sectionNavigableElements[id] = getSectionNavigableElements(id);
    allNavigableElements = allNavigableElements.concat(
      sectionNavigableElements[id]
    );
  }

  var config = extend({}, GlobalConfig, _sections[currentSectionId]);
  var next;

  if (config.restrict == 'self-only' || config.restrict == 'self-first') {
    var currentSectionNavigableElements =
      sectionNavigableElements[currentSectionId];

    next = navigate(
      currentFocusedElement,
      direction,
      exclude(currentSectionNavigableElements, currentFocusedElement),
      config
    );

    if (!next && config.restrict == 'self-first') {
      next = navigate(
        currentFocusedElement,
        direction,
        exclude(allNavigableElements, currentSectionNavigableElements),
        config
      );
    }
  } else {
    next = navigate(
      currentFocusedElement,
      direction,
      exclude(allNavigableElements, currentFocusedElement),
      config
    );
  }

  if (next) {
    _sections[currentSectionId].previous = {
      target: currentFocusedElement,
      destination: next,
      reverse: REVERSE[direction],
    };

    var nextSectionId = getSectionId(next);

    if (currentSectionId != nextSectionId) {
      var result = gotoLeaveFor(currentSectionId, direction);
      if (result) {
        return true;
      } else if (result === null) {
        fireNavigatefailed(currentFocusedElement, direction);
        return false;
      }

      var enterToElement;
      switch (_sections[nextSectionId].enterTo) {
        case 'last-focused':
          enterToElement =
            getSectionLastFocusedElement(nextSectionId) ||
            getSectionDefaultElement(nextSectionId);
          break;
        case 'default-element':
          enterToElement = getSectionDefaultElement(nextSectionId);
          break;
      }
      if (enterToElement) {
        next = enterToElement;
      }
    }

    return focusElement(next, nextSectionId, direction);
  } else if (gotoLeaveFor(currentSectionId, direction)) {
    return true;
  }

  fireNavigatefailed(currentFocusedElement, direction);
  return false;
}

function onKeyDown(evt) {
  if (
    !_sectionCount ||
    _pause ||
    evt.altKey ||
    evt.ctrlKey ||
    evt.metaKey ||
    evt.shiftKey
  ) {
    return;
  }

  let currentFocusedElement;
  const preventDefault = function() {
    evt.preventDefault();
    evt.stopPropagation();
    return false;
  };

  const direction = KEYMAPPING[evt.keyCode];
  if (!direction) {
    if (evt.keyCode == 13) {
      currentFocusedElement = getCurrentFocusedElement();
      if (currentFocusedElement && getSectionId(currentFocusedElement)) {
        if (!fireEvent(currentFocusedElement, 'enter-down')) {
          return preventDefault();
        }
      }
    }
    return;
  }

  currentFocusedElement = getCurrentFocusedElement();

  if (!currentFocusedElement) {
    if (_lastSectionId) {
      currentFocusedElement = getSectionLastFocusedElement(_lastSectionId);
    }
    if (!currentFocusedElement) {
      focusSection();
      return preventDefault();
    }
  }

  const currentSectionId = getSectionId(currentFocusedElement);
  if (!currentSectionId) {
    return;
  }

  const willmoveProperties = {
    direction: direction,
    sectionId: currentSectionId,
    cause: 'keydown',
  };

  if (fireEvent(currentFocusedElement, 'willmove', willmoveProperties)) {
    focusNext(direction, currentFocusedElement, currentSectionId);
  }

  return preventDefault();
}

function onKeyUp(evt) {
  if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
    return;
  }
  if (!_pause && _sectionCount && evt.keyCode == 13) {
    const currentFocusedElement = getCurrentFocusedElement();
    if (currentFocusedElement && getSectionId(currentFocusedElement)) {
      if (!fireEvent(currentFocusedElement, 'enter-up')) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    }
  }
}

function onFocus(evt) {
  const {target} = evt;
  if (
    target !== window &&
    target !== document &&
    _sectionCount &&
    !_duringFocusChange
  ) {
    const sectionId = getSectionId(target);
    if (sectionId) {
      if (_pause) {
        focusChanged(target, sectionId);
        return;
      }

      const focusProperties = {
        sectionId: sectionId,
        native: true,
      };

      if (!fireEvent(target, 'willfocus', focusProperties)) {
        _duringFocusChange = true;
        target.blur();
        _duringFocusChange = false;
      } else {
        fireEvent(target, 'focused', focusProperties, false);
        focusChanged(target, sectionId);
      }
    }
  }
}

function onBlur(evt) {
  const {target} = evt;
  if (
    target !== window &&
    target !== document &&
    !_pause &&
    _sectionCount &&
    !_duringFocusChange &&
    getSectionId(target)
  ) {
    const unfocusProperties = {
      native: true,
    };
    if (!fireEvent(target, 'willunfocus', unfocusProperties)) {
      _duringFocusChange = true;
      setTimeout(function() {
        target.focus();
        _duringFocusChange = false;
      });
    } else {
      fireEvent(target, 'unfocused', unfocusProperties, false);
    }
  }
}

const Navigation = {
  init: function() {
    if (!_ready) {
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);
      document.addEventListener('focus', onFocus, true);
      document.addEventListener('blur', onBlur, true);
      _ready = true;
    }
  },

  uninit: function() {
    document.removeEventListener('blur', onBlur, true);
    document.removeEventListener('focus', onFocus, true);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('keydown', onKeyDown);
    Navigation.clear();
    _idPool = 0;
    _ready = false;
  },

  clear: function() {
    _sections = {};
    _sectionCount = 0;
    _defaultSectionId = '';
    _lastSectionId = '';
    _duringFocusChange = false;
  },

  set: function() {
    let sectionId, config;

    if (typeof arguments[0] === 'object') {
      config = arguments[0];
    } else if (
      typeof arguments[0] === 'string' &&
      typeof arguments[1] === 'object'
    ) {
      sectionId = arguments[0];
      config = arguments[1];
      if (!_sections[sectionId]) {
        throw new Error('Section "' + sectionId + '" doesn\'t exist!');
      }
    } else {
      return;
    }

    for (let key in config) {
      if (GlobalConfig[key] !== undefined) {
        if (sectionId) {
          _sections[sectionId][key] = config[key];
        } else if (config[key] !== undefined) {
          GlobalConfig[key] = config[key];
        }
      }
    }

    if (sectionId) {
      _sections[sectionId] = extend({}, _sections[sectionId]);
    }
  },

  config: function() {
    let sectionId;
    const config = arguments[0];

    if (!sectionId) {
      sectionId = typeof config.id === 'string' ? config.id : generateId();
    }

    if (_sections[sectionId]) {
      throw new Error('Section "' + sectionId + '" has already existed!');
    }

    _sections[sectionId] = {};
    _sectionCount++;

    Navigation.set(sectionId, config);

    return sectionId;
  },

  remove: function(sectionId) {
    if (!sectionId || typeof sectionId !== 'string') {
      throw new Error('Please assign the "sectionId"!');
    }
    if (_sections[sectionId]) {
      _sections[sectionId] = undefined;
      _sections = extend({}, _sections);
      _sectionCount--;
      return true;
    }
    return false;
  },

  disable: function(sectionId) {
    if (_sections[sectionId]) {
      _sections[sectionId].disabled = true;
      return true;
    }
    return false;
  },

  enable: function(sectionId) {
    if (_sections[sectionId]) {
      _sections[sectionId].disabled = false;
      return true;
    }
    return false;
  },

  pause: function() {
    _pause = true;
  },

  resume: function() {
    _pause = false;
  },

  focus: function(elem, silent) {
    let result = false;

    if (silent === undefined && typeof elem === 'boolean') {
      silent = elem;
      elem = undefined;
    }

    let autoPause = !_pause && silent;

    if (autoPause) {
      Navigation.pause();
    }

    if (!elem) {
      result = focusSection();
    } else {
      if (typeof elem === 'string') {
        if (_sections[elem]) {
          result = focusSection(elem);
        } else {
          result = focusExtendedSelector(elem);
        }
      } else {
        const nextSectionId = getSectionId(elem);
        if (isNavigable(elem, nextSectionId)) {
          result = focusElement(elem, nextSectionId);
        }
      }
    }

    if (autoPause) {
      Navigation.resume();
    }

    return result;
  },

  move: function(direction, selector) {
    direction = direction.toLowerCase();
    if (!REVERSE[direction]) {
      return false;
    }

    let elem = selector
      ? parseSelector(selector)[0]
      : getCurrentFocusedElement();
    if (!elem) {
      return false;
    }

    let sectionId = getSectionId(elem);
    if (!sectionId) {
      return false;
    }

    let willmoveProperties = {
      direction: direction,
      sectionId: sectionId,
      cause: 'api',
    };

    if (!fireEvent(elem, 'willmove', willmoveProperties)) {
      return false;
    }

    return focusNext(direction, elem, sectionId);
  },

  focusableElements: function(sectionId) {
    const makeFocusable = function(section) {
      const tabIndexIgnoreList =
        section.tabIndexIgnoreList !== undefined
          ? section.tabIndexIgnoreList
          : GlobalConfig.tabIndexIgnoreList;
      parseSelector(section.selector).forEach(function(elem) {
        if (!matchSelector(elem, tabIndexIgnoreList)) {
          if (!elem.getAttribute('tabindex')) {
            elem.setAttribute('tabindex', '-1');
          }
        }
      });
    };

    if (sectionId) {
      if (_sections[sectionId]) {
        makeFocusable(_sections[sectionId]);
      } else {
        throw new Error('Section "' + sectionId + '" doesn\'t exist!');
      }
    } else {
      for (let id in _sections) {
        makeFocusable(_sections[id]);
      }
    }
  },

  setDefaultSection: function(sectionId) {
    if (!sectionId) {
      _defaultSectionId = '';
    } else if (!_sections[sectionId]) {
      throw new Error('Section "' + sectionId + '" doesn\'t exist!');
    } else {
      _defaultSectionId = sectionId;
    }
  },
};

export default Navigation;
