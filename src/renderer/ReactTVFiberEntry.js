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

import type {HostConfig, Reconciler} from 'react-fiber-types';
import type {ReactNodeList} from 'react-fiber-types/ReactTypes';

const ReactTVFiberComponent = require('./ReactTVFiberComponent');

import type {
  Props,
  Container,
  Instance,
  TextInstance,
  OpaqueHandle,
  HostContext,
} from './ReactTVFiberTypes';

const ReactFiberReconciler: (
  hostConfig: HostConfig<*, *, *, *, *, *, *, *>
) => Reconciler<*, *, *> = require('react-dom/lib/ReactFiberReconciler');

const {
  createElement,
} = ReactTVFiberComponent;

const LOG_STEPS = false;
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

const ReactTVRender = ReactFiberReconciler({
  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object
  ): Object {
    if (props.toJSON && typeof toJSON === 'function') {
      return props.toJSON(props);
    } else {
      let parentNamespace: string;
      parentNamespace = hostContext;

      const domElement: Instance = createElement(
        type,
        props,
        rootContainerInstance,
        parentNamespace,
      );

      // TODO: precacheFiberNode
      // TODO: updateFiberProps
      return domElement;
    }
  },

  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance
  ): void {
    log('appendInitialChild', child);
  },

  appendChild(
    parentInstance: Instance | Container,
    child: Instance | TextInstance
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
    child: Instance | TextInstance
  ): void {
    log('removeChild', child);
    // parentInstance.removeChild(child);
  },

  insertBefore(
    parentInstance: Instance | Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance
  ): void {
    log('insertBefore');
    // parentInstance.insertBefore(child, beforeChild);
  },

  finalizeInitialChildren(
    instance: Instance,
    type: string,
    props: Props,
    rootContainerInstance: Container
  ): boolean {
    log('finalizeInitialChildren');
    // setInitialProperties(instance, type, props, rootContainerInstance);
    return false;
  },

  prepareUpdate(
    instance: Instance,
    type: string,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
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
    internalInstanceHandle: Object
  ): void {
    log('TODO: updateProperties');
  },

  commitMount(
    instance: Instance,
    type: string,
    newProps: Props,
    internalInstanceHandle: Object
  ) {
    log('commitMount');
    // noop
  },

  getRootHostContext(rootContainerInstance: Container): HostContext {
    log('getRootHostContext', rootContainerInstance);
    return emptyObject;
  },

  getChildHostContext(
    parentHostContext: HostContext,
    type: string
  ): HostContext {
    log('getChildHostContext', parentHostContext);
    return emptyObject;
  },

  getPublicInstance(instance: Instance | TextInstance) {
    log('getPublicInstance');
    if (instance == null) {
      return null;
    }
    console.log(instance);
    return instance != null && instance.props.toJSON(instance);
  },

  prepareForCommit(): void {
    log('prepareForCommit');
    // noop
  },

  resetAfterCommit(): void {
    log('resetAfterCommit');
    // noop
  },

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
    internalInstanceHandle: OpaqueHandle
  ): TextInstance {
    log('createTextInstance');
    return null;
  },

  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string
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
  render(element: React$Element<any>, container: any, callback: ?Function) {
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
