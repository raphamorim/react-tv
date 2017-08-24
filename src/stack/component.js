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

/**
 * React Components are the heart and soul of a React renderer. This is the
 * internal side of a consumer's ReactComponents. At a high level, you will
 * define one or more internal components to map to the public interface of your
 * renderer. Below this we have defined two ReactComponents.
 *
 * * MinimumViableComponent
 * * TinyRendererComponent
 *
 * MinimumViableComponent is an overview of the minimum interface required to be
 * a valid ReactComponent.
 *
 * TinyRendererComponent is the component that is constructed in the Tiny React
 * Renderer.
 */
'use strict';

const ReactMultiChild = require('react/lib/ReactMultiChild');
const serialize = require('./utilities/serialize');

/**
 * This MinimumViableComponent is the minimal interface to be recognized as a
 * valid React Component with support for rendering children. This is assuming
 * that the default case for a component is to support children.
 *
 * This has a very symmetrical relationship to the userland side of creating a
 * React Component. In addition, there are private methods used by other parts
 * of React Core, such as `getPublicInstance` or
 * React <= 15.0 `getNativeNode`
 * React > 15.0 `getHostNode`
 */
const MinimumViableComponent = function(element) {
  // This internal API—while relatively unchanged for a while—is likely pretty
  // volatile. Many of these names began with ReactDOM and ReactART which may
  // not be the *best* abstraction for them.

  // `this.node` in ReactDOM points to the DOM node of a component.
  // `getNativeNode`/`getHostNode` should return this.
  this.node = null;
  // `this._mountImage` is the representation you use to render a ReactElement
  // hierarchy. This could be an HTML string, a DOM node, or an identifier or
  // simple representation that maps to the final result such as native UI
  // controls.
  this._mountImage = null;
  // `this._renderedChildren` is something in the form of null|Child|Array<Child>
  // `ReactMultiChild.Mixin` is primarily responsible for managing this property
  this._renderedChildren = null;
  // `this._currentElement` is the currently rendered ReactElement. This is
  // important because it allows you to compare the node and props on lifecycle
  // methods to update appropriately.
  this._currentElement = element;
};

MinimumViableComponent.prototype = Object.assign(
  {
    // A nice symmetry to [TODO: React Lifecycle Methods] exists here.
    // These are the required methods to implement. You may additionally provide
    // custom implementations of other lifecycle methods or any arbitrary
    // methods that are private to your implementation.
    getPublicInstance() {},
    mountComponent() {},
    receiveComponent() {},
    unmountComponent() {},
    // Implement both of these for now. React <= 15.0 uses getNativeNode, but
    // that is confusing. Host environment is more accurate and will be used
    // going forward
    getNativeNode() {},
    getHostNode() {},
  },
  ReactMultiChild.Mixin,
);

/**
 * The fun begins! Well, it would in a not-so-tiny renderer, but for here it’s
 * pretty straight-forward. The idea for this particular implementation came
 * from conversations with Ryan Florence and Michael Jackson from the React
 * Router/React.js Training teams.
 *
 * React Router supports two route configuration approaches:
 *
 * 1. ReactComponents `<Router><Route path="/" component={C} />{...}</Router>`
 * 2. Object Literal `[{path: '/', component: C}, {path: '/list', component: L}]`
 *
 * As I understand it, both approaches result in the object literal, it’s just a
 * matter of the path to get there. The question then is what would it look
 * like to write a renderer that accomplishes the ReactComponent authoring style
 * in a more elegant way?
 *
 * If you recall from our mount.js render method, the return value or callback
 * is called with the result of `component.getPublicInstance()`. We want this to
 * be the JSON representation of our route configuration.
 *
 * Below we will provide a default serialize.toJSON implementation and the bare
 * minimum required to mount and update these ReactElements.
 */
const TinyRendererComponent = function(element) {
  this.node = null;
  this._mountImage = null;
  this._renderedChildren = null;
  this._currentElement = element;
};

const TinyRendererComponentMixin = {
  getPublicInstance() {
    // serialize.toJSON is the default serialization provided.
    //
    // It simply returns the node.props of a component with serialized children.
    // It also looks at whether a component has a custom `toJSON` method and will
    // use that instead, allowing consumers to provide their own serialization and
    // impacting the resulting public instance.

    return serialize.toJSON(this.node);
  },

  mountComponent(transaction, nativeParent, nativeContainerInfo, context) {
    // In a not-so-tiny renderer you would also want to validate the properties
    // (in dev mode) and apply them to the host environment.
    // I have often seen renderers have a `render` method defined on their
    // internal component implementation that is responsible for calling the
    // appropriate methods to update the UI. For example that could be DOM
    // methods, ReactNativeUIManager bridging calls, or node-blessed methods.
    this.node = this._currentElement;
    this.mountChildren(this.node.children, transaction, context);

    return this.node;
  },

  receiveComponent(nextElement, transaction, context) {
    // Typically you would diff the props and apply those to the host
    // environment, though all we need to do is swap out our _currentElement.
    const prevElement = this._currentElement;
    this._currentElement = nextElement;

    // this.updateChildren comes from ReactMultiChild.Mixin
    this.updateChildren(nextElement.props.children, transaction, context);
  },
  // there is no native node
  getHostNode() {},
  // how do you unmount JSON?
  unmountComponent() {},
};

Object.assign(
  TinyRendererComponent.prototype,
  TinyRendererComponentMixin,
  ReactMultiChild.Mixin,
);

/**
 * CONGRATULATIONS! You now understand the basics of how a React Renderer works.
 * While there are still a lot of React internals we didn’t look at, you saw the
 * foundational pieces. Most every renderer listed on
 * http://iamdustan.com/react-renderers has the same entry path and hooks as
 * what you just learned.
 *
 * A lot of ReactDOM and ReactNative’s source is integrating the concepts we
 * just learned in this binding layer to a host environment. From this
 * foundation you have a solid understanding of the glue. ReactCore deals with
 * details of reconciliation and transactions, while renderers are plumbing.
 *
 * Fin.
 */
module.exports = TinyRendererComponent;
