/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberEntry
 * @flow
 */

'use strict';

/**
 * The two internal types you need to be aware of. Everything else should be
 * kept private except host-specific things that you handle in your renderer.
 */
import type {HostConfig, Reconciler} from 'react-fiber-types';
import type {ReactNodeList} from 'react-fiber-types/ReactTypes';

// our renconciler types are defined in ./ReactTinyTypes.js for a convenient place to see
// what types you’re expected to define when implementing a renderer
import type {
  Props,
  Container,
  Instance,
  TextInstance,
  OpaqueHandle,
  HostContext,
} from './Types';

/**
 * This is the only entry point you need to create a Fiber renderer. Note that
 * it currently lives within the `react-dom` package and not `react.
 */
const ReactFiberReconciler: (
  hostConfig: HostConfig<*, *, *, *, *, *, *, *>,
) => Reconciler<*, *, *> = require('react-dom/lib/ReactFiberReconciler');

const LOG_STEPS = true;
const log = (a, b, c) => {
  if (LOG_STEPS) {
    console.log(a, b, c);
  }
};

function toJSON(node) {
  if (typeof node === 'string') {
    return node;
  }

  const props = node.props || node;
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
}

/**
 * The fun begins!
 *
 * We create a private reconciler instance. The methods defined here can be
 * thought of as the lifecycle of a renderer. React will manage all non-host
 * components, such as composites, stateless, and fragments.
 */
const ReactTVRender = ReactFiberReconciler({
  // the tree creation and updating methods. If you’re familiar with the DOM API
  // this will look familiar

  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object,
  ) {
    if (props.toJSON && typeof toJSON === 'function') {
      return props.toJSON(props);
    } else {
      return toJSON({props});
    }
  },

  // this is called instead of `appendChild` when the parentInstance is first
  // being created and mounted
  // added in https://github.com/facebook/react/pull/8400/
  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    //
    log('appendInitialChild', child);
  },

  appendChild(
    parentInstance: Instance | Container,
    child: Instance | TextInstance,
  ): void {
    log('appendChild', child);
    // const index = parentInstance.children.indexOf(child);
    // if (index !== -1) {
    //   parentInstance.children.splice(index, 1);
    // }
    // parentInstance.children.push(child);
  },

  removeChild(
    parentInstance: Instance | Container,
    child: Instance | TextInstance,
  ): void {
    log('removeChild', child);
    // parentInstance.removeChild(child);
  },

  insertBefore(
    parentInstance: Instance | Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    log('insertBefore');
    // parentInstance.insertBefore(child, beforeChild);
  },

  // finalizeInitialChildren is the final HostConfig method called before
  // flushing the root component to the host environment

  finalizeInitialChildren(
    instance: Instance,
    type: string,
    props: Props,
    rootContainerInstance: Container,
  ): boolean {
    log('finalizeInitialChildren');
    // setInitialProperties(instance, type, props, rootContainerInstance);
    return false;
  },

  // prepare update is where you compute the diff for an instance. This is done
  // here to separate computation of the diff to the applying of the diff. Fiber
  // can reuse this work even if it pauses or aborts rendering a subset of the
  // tree.

  prepareUpdate(
    instance: Instance,
    type: string,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): null | Array<mixed> {
    log('TODO: prepareUpdate');
    return null;
    // return diffProperties(instance, type, oldProps, newProps, rootContainerInstance, hostContext);
  },

  commitUpdate(
    instance: Instance,
    updatePayload: Array<mixed>,
    type: string,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: Object,
  ): void {
    // Apply the diff to the DOM node.
    // updateProperties(instance, updatePayload, type, oldProps, newProps);
    log('TODO: updateProperties');
  },

  // commitMount is called after initializeFinalChildren *if*
  // `initializeFinalChildren` returns true.

  commitMount(
    instance: Instance,
    type: string,
    newProps: Props,
    internalInstanceHandle: Object,
  ) {
    log('commitMount');
    // noop
  },

  // HostContext is an internal object or reference for any bookkeeping your
  // renderer may need to do based on current location in the tree. In DOM this
  // is necessary for calling the correct `document.createElement` calls based
  // upon being in an `html`, `svg`, `mathml`, or other context of the tree.

  getRootHostContext(rootContainerInstance: Container): HostContext {
    log('getRootHostContext', rootContainerInstance);
    return emptyObject;
  },

  getChildHostContext(
    parentHostContext: HostContext,
    type: string,
  ): HostContext {
    log('getChildHostContext', parentHostContext);
    return emptyObject;
  },

  // getPublicInstance should be the identity function in 99% of all scenarios.
  // It was added to support the `getNodeMock` functionality for the
  // TestRenderers.

  getPublicInstance(instance: Instance | TextInstance) {
    log('getPublicInstance');
    if (instance == null) {
      return null;
    }
    console.log(instance);
    return instance != null && instance.props.toJSON(instance);
  },

  // the prepareForCommit and resetAfterCommit methods are necessary for any
  // global side-effects you need to trigger in the host environment. In
  // ReactDOM this does things like disable the ReactDOM events to ensure no
  // callbacks are fired during DOM manipulations

  prepareForCommit(): void {
    log('prepareForCommit');
    // noop
  },

  resetAfterCommit(): void {
    log('resetAfterCommit');
    // noop
  },

  // the following four methods are regarding TextInstances. In our example
  // renderer we don’t have specific text nodes like the DOM does so we’ll just
  // noop all of them.

  shouldSetTextContent(props: Props): boolean {
    log('shouldSetTextContent');
    return false;
  },

  resetTextContent(instance: Instance): void {
    log('resetTextContent');
    // noop
  },

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
  ): TextInstance {
    log('createTextInstance');
    return null;
  },

  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string,
  ): void {
    log('commitTextUpdate');
    // noop
    throw new Error('commitTextUpdate should not be called');
  },

  scheduleAnimationCallback() {
    log('scheduleAnimationCallback');
  },

  scheduleDeferredCallback() {
    log('scheduleDeferredCallback');
  },

  useSyncScheduling: true,
});

const defaultContainer = {};
const ReactTV = {
  render(element: React$Element<any>, callback: ?Function, container: any) {
    const containerKey =
      typeof container === 'undefined' ? defaultContainer : container;
    let root = roots.get(containerKey);
    if (!root) {
      root = ReactTVRender.createContainer(containerKey);
      roots.set(container, root);
    }

    ReactTVRender.updateContainer((element: any), root, null, callback);
    return ReactTVRender.getPublicRootInstance(root);
  },
  unmountComponentAtNode(container: any) {
    const containerKey =
      typeof container === 'undefined' ? defaultContainer : container;
    const root = roots.get(containerKey);
    if (root) {
      ReactTVRender.updateContainer(null, root, null, () => {
        roots.delete(container);
      });
    }
  },
};

const roots = new Map();
const emptyObject = {};

module.exports = ReactTV;
