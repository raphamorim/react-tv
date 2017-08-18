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
 * This file has been authored in a linear manner and is not reflective of many
 * of the steps you would take while writing a production renderer.
 *
 * We’re going to look at the four required modules that a React renderer has.
 * Beyond this you will have the work that binds a renderer implementation to a
 * host environment. For this Tiny React Renderer we’re implementing a glorified
 * `toJSON` renderer and will not have that. See
 * [Appendix 3: Host Environment Examples](https://github.com/iamdustan/tiny-react-renderer/tree/master/appendix/3-Host-Environment-Examples.md)
 * to learn more.
 *
 * The four core modules in a React renderer are:
 *
 * * DefaultInjection
 * * Mount
 * * Component
 * * ReconcileTransaction
 *
 * `DefaultInjection` must inject its implementations before any other work can
 * be done. It is part of a renderer's initialization process.
 *
 * `Mount` can be thought of a renderer's `main` method. All userland code enters
 * the React world through this door.
 *
 * `ReconcileTransaction` is a class which maintains the logic for how
 * reconciliations take place. Many renderers can use the simple transaction as
 * provided in here, although a lot of complexity can be contained within here.
 * See [Appendix 2: Reconcile Transaction](https://github.com/iamdustan/tiny-react-renderer/tree/master/appendix/2-Reconcile-Transaction.md)
 * for a deeper look into the default DOM ReactReconcileTransaction details.
 *
 * `Component` is the internal class to a consumer's component. This is where
 * property diffing is computed and applied and where the realization of a
 * renderer takes place.
 */

/**
 * As with most modern JavaScript projects in 2016, we begin by importing our
 * dependencies. The first dependency here will typically be seen inline, but
 * has been moved out for clarity while reading the primary `mount` method
 * below.
 *
 * After this we require a few React internal modules that allow us to
 * instantiate ReactComponents and integrate with the reconciliation algorithm.
 *
 * The final require introduces us to a common pattern in React core which is
 * the ability to `inject` an implementation into different parts of the core
 * application. For example, ReactDOM injects a generic component class that
 * handles rendering <div />, <span />, and <table />, and any other DOM node.
 *
 * The `./injection.js` file documents this in greater detail.
 */
'use strict';

const invariants = require('./utilities/invariants');
const instantiateReactComponent = require('react/lib/instantiateReactComponent');
const ReactInstanceHandles = require('react/lib/ReactInstanceHandles');
const ReactUpdates = require('react/lib/ReactUpdates');
const DefaultInjection = require('./injection');

/**
 * Step 0. Inject the unique aspects of your renderer into React core
 * immediately. These will be things like your event system, generic component
 * handler, reconciliation strategy, or batching strategy.
 */
DefaultInjection.inject();

/**
 * Step 1. Userlands entry into the React world. Regardless of the renderer you
 * use—whether ReactDOM, ReactNative, ReactHardware, ReactBlessed, or one of the
 * many others—all `ReactDOM.render|RN.registerComponent|ReactBlessed.render`
 * type of methods will enter the React world through this method.
 *
 * As an example:
 * ```
 * ReactDOM.render(
 *   <div><span>Hello</span>, <b>World</b></div>,
 *   document.getElementById('app'),
 *   (inst) => console.log(inst)
 * );
 * ```
 *
 * will reach this method in the `ReactMount` module. Your signature should have
 * the `ReactElement` as the first argument, an optional callback as the last
 * argument, and any environment-specific arguments in between.
 *
 * Optionally, you may return the public instance of the rendered component as
 * the return value.
 **/
const render = (
  nextElement, // ReactElement description.
  callback // optional callback for when mount is complete
) => {

  // The first thing you'll want to do in here is confirm the caller passed in a
  // valid ReactElement. The implementation of this is the same across renderers
  // with the exception of the error message through when the invariant fails.
  invariants.isValidElement(nextElement);

  // For this tiny renderer, we do not have a target element to render into,
  // though many renderers have this concern. In this scenario you should
  // consider applying a `warning` or `invariant` to that argument to ensure the
  // consumer has an educational experience in development mode. A key objective
  // of writing a renderer is to make interacting with the host system simpler.
  // A given renderer should seek to help its users to avoid simple mistakes.
  // such as passing in a non-existent DOM node.
  //
  // @example:
  //   warning.isValidTargetElement(targetElement);

  // Appendix 1: Rerendering A Top Level Element
  // https://github.com/iamdustan/tiny-react-renderer/tree/master/appendix/1-Rendering-A-Top-Level-Element.md
  //
  // If there is a target element or the opportunity to reuse a previous render
  // call, you would look up the previous element and reconcile from there.

  // Woohoo! The consumer has now made it to the point where we’re interacting
  // with React internals! Since any application can have multiple roots, we
  // want to get an identifier from the `ReactInstanceHandles` component.
  //
  // Next we instantiate a new ReactComponent from the ReactElement passed in.
  // See [React glossary](https://facebook.github.io/react/docs/glossary.html)
  // for more context on the relationship between ReactComponent and ReactElement.
  const rootId = ReactInstanceHandles.createReactRootID(0);
  const component = instantiateReactComponent(nextElement);

  // The initial render is currently synchronous, but any updates that happen
  // during rendering, in componentWillMount or componentDidMount, will be
  // batched according to the current batching strategy.
  //
  // Note: there is ongoing research for creating an incremental reconciler
  // which may impact this aspect of renderer creation.
  //
  // Assuming you’ve read the [React Reconciliation Algorithm](https://facebook.github.io/react/docs/reconciliation.html) article on
  // the React docs, this may be familiar. The “public” API for accomplishing
  // this is done with a batching strategy and transaction. React provides
  // default implementations for both of these and does not require any effort
  // from us other than calling them.
  ReactUpdates.batchedUpdates(() => {
    // Two points to React for using object pooling internally and being good
    // stewards of garbage collection and memory pressure.
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(() => {
      // The `component` here is an instance of your
      // `ReactCustomRendererComponent` class. To be 100% honest, I’m not
      // certain if the method signature is enforced by React core or if it is
      // renderer specific. This is following the ReactDOM renderer. The
      // important piece is that we pass our transaction and rootId through, in
      // addition to any other contextual information needed.
      component.mountComponent(
        transaction,
        rootId,
        // TODO: what is _idCounter used for and when should it be nonzero?
        {_idCounter: 0},
        {}
      );
      if (callback) {
        callback(component.getPublicInstance());
      }
    });
    ReactUpdates.ReactReconcileTransaction.release(transaction);

  });

  return component.getPublicInstance();
};

// Congratulations! You’ve done it! You have a React renderer! Though so far
// we haven’t done anything interesting. For that we need to implement our
// ReactComponent class. For that you’ll head over to `./component.js`. See you
// there!
module.exports = render;

