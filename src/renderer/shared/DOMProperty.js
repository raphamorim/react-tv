/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function isReservedProp(name) {
  const RESERVED_PROPS = {
    children: true,
    defaultValue: true,
    defaultChecked: true,
    innerHTML: true,
    suppressContentEditableWarning: true,
    suppressHydrationWarning: true,
    style: true,
  };

  return RESERVED_PROPS.hasOwnProperty(name);
}

/**
 * Checks whether a property name is a writeable attribute.
 * @method
 */
export function shouldSetAttribute(name, value) {
  if (isReservedProp(name)) {
    return false;
  }
  if (
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N') &&
    name.length > 2
  ) {
    return false;
  }
  if (value === null) {
    return true;
  }
  switch (typeof value) {
    case 'boolean':
      return true;
    case 'undefined':
    case 'number':
    case 'string':
    case 'object':
      return true;
    default:
      // function, symbol
      return false;
  }
}
