/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberEntry
 * @flow
 */

import type {HostConfig, Reconciler} from 'react-fiber-types';
import type {ReactNodeList} from 'react-fiber-types/ReactTypes';
import type {
  Props,
  Container,
  Instance,
  TextInstance,
  OpaqueHandle,
  HostContext,
} from './ReactTVFiberTypes';

import ReactTVFiberComponent from './ReactTVFiberComponent';
import ReactFiberReconciler from 'react-dom/lib/ReactFiberReconciler';
import {getChildNamespace} from './shared/DOMNamespaces';

import {
  ELEMENT_NODE,
  TEXT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  COMMENT_NODE,
} from './shared/HTMLNodeType';

const {
  createElement,
  createTextNode,
  setInitialProperties,
  diffProperties,
  updateProperties,
} = ReactTVFiberComponent;

const LOG_STEPS = false;
const log = (a, b, c) => {
  if (LOG_STEPS) {
    console.log(a, b, c);
  }
};

const ReactTVFiberRenderer = ReactFiberReconciler({
  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object
  ): Object {
    log('createInstance');

    let parentNamespace: string;
    parentNamespace = hostContext;

    const domElement: Instance = createElement(
      type,
      props,
      rootContainerInstance,
      parentNamespace
    );

    // TODO: precacheFiberNode
    // TODO: updateFiberProps
    return domElement;
  },

  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance
  ): void {
    log('appendInitialChild', parentInstance, child);
    parentInstance.appendChild(child);
  },

  appendChild(
    parentInstance: Instance | Container,
    child: Instance | TextInstance
  ): void {
    log('appendChild', parentInstance, child);
    parentInstance.appendChild(child);
  },

  appendChildToContainer(
    container: Container,
    child: Instance | TextInstance
  ): void {
    log('appendChildToContainer');
    if (container.nodeType === COMMENT_NODE) {
      (container.parentNode: any).insertBefore(child, container);
    } else {
      container.appendChild(child);
    }
  },

  removeChild(
    parentInstance: Instance | Container,
    child: Instance | TextInstance
  ): void {
    log('removeChild', child);
    parentInstance.removeChild(child);
  },

  removeChildFromContainer(
    container: Container,
    child: Instance | TextInstance
  ): void {
    if (container.nodeType === COMMENT_NODE) {
      (container.parentNode: any).removeChild(child);
    } else {
      container.removeChild(child);
    }
  },

  insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance
  ): void {
    log('insertBefore');
    parentInstance.insertBefore(child, beforeChild);
  },

  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance
  ): void {
    log('insertInContainerBefore');
    if (container.nodeType === COMMENT_NODE) {
      (container.parentNode: any).insertBefore(child, beforeChild);
    } else {
      container.insertBefore(child, beforeChild);
    }
  },

  finalizeInitialChildren(
    domElement: Instance,
    type: string,
    props: Props,
    rootContainerInstance: Container
  ): boolean {
    log('finalizeInitialChildren');
    setInitialProperties(domElement, type, props, rootContainerInstance);
  },

  prepareUpdate(
    domElement: Instance,
    type: string,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
  ): null | Array<mixed> {
    log('prepareUpdate');
    return diffProperties(
      domElement,
      type,
      oldProps,
      newProps,
      rootContainerInstance
    );
  },

  commitUpdate(
    domElement: Instance,
    updatePayload: Array<mixed>,
    type: string,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: Object
  ): void {
    log('commitUpdate');
    // TODO: updateFiberProps
    updateProperties(domElement, updatePayload, type, oldProps, newProps);
  },

  commitMount(
    domElement: Instance,
    type: string,
    newProps: Props,
    internalInstanceHandle: Object
  ) {
    log('commitMount');
  },

  getRootHostContext(rootContainerInstance: Container): HostContext {
    log('getRootHostContext', rootContainerInstance);
    let type;
    let namespace;
    const nodeType = rootContainerInstance.nodeType;
    switch (nodeType) {
      case DOCUMENT_NODE:
      case DOCUMENT_FRAGMENT_NODE: {
        type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment';
        let root = (rootContainerInstance: any).documentElement;
        namespace = root ? root.namespaceURI : getChildNamespace(null, '');
        break;
      }
      default: {
        const container: any =
          nodeType === COMMENT_NODE
            ? rootContainerInstance.parentNode
            : rootContainerInstance;
        const ownNamespace = container.namespaceURI || null;
        type = container.tagName;
        namespace = getChildNamespace(ownNamespace, type);
        break;
      }
    }
    return namespace;
  },

  getChildHostContext(
    parentHostContext: HostContext,
    type: string
  ): HostContext {
    log('getChildHostContext');
    return getChildNamespace(parentHostContext, type);
  },

  getPublicInstance(instance: Instance | TextInstance) {
    return instance;
  },

  prepareForCommit(): void {
    log('prepareForCommit');
  },

  resetAfterCommit(): void {
    log('resetAfterCommit');
  },

  shouldSetTextContent(props: Props): boolean {
    return (
      typeof props.children === 'string' || typeof props.children === 'number'
    );
  },

  resetTextContent(domElement: Instance): void {
    domElement.textContent = '';
  },

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object
  ): TextInstance {
    log('createTextInstance');
    let textNode: TextInstance = createTextNode(text, rootContainerInstance);
    // TODO: precacheFiberNode(internalInstanceHandle, textNode);
    return textNode;
  },

  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string
  ): void {
    log('commitTextUpdate');
    textInstance.nodeValue = newText;
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
const roots = new Map();

const ReactTVRenderer = {
  render(element: React$Element<any>, container: any, callback: ?Function) {
    const containerKey =
      typeof container === 'undefined' ? defaultContainer : container;
    let root = roots.get(containerKey);
    if (!root) {
      root = ReactTVFiberRenderer.createContainer(containerKey);
      roots.set(container, root);
    }

    ReactTVFiberRenderer.updateContainer((element: any), root, null, callback);
    return ReactTVFiberRenderer.getPublicRootInstance(root);
  },
  unmountComponentAtNode(container: any) {
    const containerKey =
      typeof container === 'undefined' ? defaultContainer : container;
    const root = roots.get(containerKey);
    if (root) {
      ReactTVFiberRenderer.updateContainer(null, root, null, () => {
        roots.delete(container);
      });
    }
  },
};

export default ReactTVRenderer;
