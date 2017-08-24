/***
 * Welcome to the Tiny React Renderer.
 * 
 * You should read this guide in the following order:
 *
 * 1. mount.js
 * 2. injection.js
 * 3. component.js
 * 4. Any of the appendices you find interesting and the many React renderer
 *    source files.
 */
'use strict';

const invariant = require('fbjs/lib/invariant');
const ReactElement = require('react/lib/ReactElement');

const isValidElement = nextElement =>
  invariant(
    ReactElement.isValidElement(nextElement),
    'ReactHardware.render(): Invalid component element.%s',
    typeof nextElement === 'function'
      ? ' Instead of passing a component class, make sure to instantiate ' +
        'it by passing it to React.createElement.'
      : // Check if it quacks like an element
        nextElement != null && nextElement.props !== undefined
        ? ' This may be caused by unintentionally loading two independent ' +
          'copies of React.'
        : '',
  );

module.exports = {
  isValidElement: isValidElement,
};
