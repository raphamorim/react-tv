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

const toJSON = (node) => {
  const props = node.props;
  if (typeof props.toJSON === 'function') {
    return props.toJSON(props);
  }

  let children = null;
  if (props.children) {
    if (Array.isArray(props.children)) {
      children = props.children.map(toJSON);
    } else if (props.children) {
      children = toJSON(props.children);
    }
    return Object.assign({}, props, {children});
  } else {
    const clone = Object.assign({}, props);
    delete clone.children;
    return clone;
  }
};

module.exports = {toJSON};

