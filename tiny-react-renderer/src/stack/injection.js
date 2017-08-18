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
 * A React renderer is responsible for injecting the implementations for one or
 * more internal concepts.
 *
 * The following list of 28 files is the result of searching for `inject` in the
 * React source code as of React 15.0.0. Since these are private APIs this is
 * not intended to be a dictionary of all possible injection points, but to
 * provide a reference of areas that may have the possibility to be customized.
 *
 * * BeforeInputEventPlugin.js
 * * DefaultEventPluginOrder.js
 * * dangerousStyleValue.js
 * * DOMProperty.js
 * * EventPluginHub.js
 * * EventPluginRegistry.js
 * * EventPluginUtils.js
 * * HTMLDOMPropertyConfig.js
 * * ReactBrowserEventEmitter.js
 * * ReactComponentBrowserEnvironment.js
 * * ReactComponent.js
 * * ReactComponentEnvironment.js
 * * ReactClass.js
 * * ReactDOM.js
 * * ReactDefaultInjection.js
 * * ReactDefaultPerf.js
 * * ReactDOMServer.js
 * * ReactDOMComponent.js
 * * ReactEmptyComponent.js
 * * ReactInjection.js
 * * ReactHostComponent.js
 * * ReactPerf.js
 * * ReactMount.js
 * * ReactServerRendering.js
 * * ReactTestUtils.js
 * * ReactUpdates.js
 * * ResponderEventPlugin.js
 * * Transaction.js
 */
'use strict';

/**
 * ReactInjection is likely the most stable location to look for injection
 * points. As of 15.0.0 this contains the following 10 modules:
 *
 * * Component
 * * Class
 * * DOMProperty
 * * EmptyComponent
 * * EventPluginHub
 * * EventPluginUtils
 * * EventEmitter
 * * HostComponent
 * * Perf
 * * Updates
 *
 * Some of these can be injected verbatim for most scenarios, and we provide our
 * component implementation(s) to be called at the appropriate times.
 */
const ReactInjection = require('react/lib/ReactInjection');
const ReactDefaultBatchingStrategy = require('react/lib/ReactDefaultBatchingStrategy');
const TinyRendererReconcileTransaction = require('./reconcileTransaction');
const TinyRendererComponent = require('./component');

function inject() {
  // For the Tiny React Renderer only the generic component class will be
  // injected. The HostComponent injection has the following three methods:
  //
  // * injectGenericComponentClass
  // * injectTextComponentClass
  //
  // `GenericComponentClass` is analogous to $JSXInstrinsics in flow
  // terminology. This is a lowercase JSXElement such as <div />
  //
  // `TextComponentClass` is what class should be used when text is being
  // rendered. This is what would be called for the single child in
  // <div>Hello, world.</div>
  (ReactInjection.NativeComponent || ReactInjection.HostComponent).injectGenericComponentClass(
    TinyRendererComponent
  );

  ReactInjection.Updates.injectReconcileTransaction(
    TinyRendererReconcileTransaction
  );

  ReactInjection.Updates.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );
}

module.exports = {inject};

